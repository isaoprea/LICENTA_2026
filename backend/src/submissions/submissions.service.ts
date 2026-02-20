import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException, 
  InternalServerErrorException 
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';

export interface TestDetail {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  private pistonRuntimeCache: Record<string, string[]> | null = null;
  private pistonRuntimeFetchedAt = 0;

  /**
   * Comunică cu motorul Piston din Docker
   */
  async callPiston(language: string, code: string, input: string) {
    // Folosim 127.0.0.1 pentru a evita erorile de rezoluție IPv6 pe Windows
    const baseRoot = process.env.PISTON_URL_BASE || "http://127.0.0.1:2000/api/v2";
    const executeUrl = `${baseRoot}/execute`;
    const runtimesUrl = `${baseRoot}/runtimes`;

    // Mapare exactă conform numelor din motorul Piston
    const languageAliases: Record<string, string[]> = {
      javascript: ["node", "javascript", "nodejs"],
      python: ["python", "python3", "py"],
      cpp: ["cpp", "c++", "gcc"]
    };

    const searchAliases = languageAliases[language.toLowerCase()] || [language.toLowerCase()];
    
    try {
      // Obținem versiunea corectă instalată în Docker
      const { language: pistonLanguage, version } = await this.getPistonVersion(runtimesUrl, searchAliases);
      
      console.log(`[DEBUG] Trimitere către Piston: ${pistonLanguage} v${version}`);

      const response = await fetch(executeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: pistonLanguage,
          version: version,
          files: [{ content: code }],
          stdin: input || ""
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Piston status ${response.status}: ${errorData}`);
      }

      const data: any = await response.json();
      const run = data.run || {};

      return {
        output: (run.output || "").trim(),
        stderr: (run.stderr || "").trim(),
        code: run.code
      };
    } catch (error: any) {
      console.error('[CRITICAL] Eroare Piston:', error.message);
      // Aruncăm eroarea pentru a fi marcată în detaliile testului
      throw new Error(`Conexiune motor eșuată: ${error.message}`);
    }
  }

  private async getPistonVersion(
    runtimesUrl: string,
    aliases: string[]
  ): Promise<{ language: string; version: string }> {
    const now = Date.now();
    
    // Refresh cache la 5 minute
    if (!this.pistonRuntimeCache || now - this.pistonRuntimeFetchedAt > 5 * 60 * 1000) {
      const response = await fetch(runtimesUrl);
      if (!response.ok) throw new Error("Nu pot citi limbajele din Piston.");
      
      const runtimes: Array<{ language: string; version: string }> = await response.json();
      const cache: Record<string, string[]> = {};
      
      runtimes.forEach(r => {
        if (!cache[r.language]) cache[r.language] = [];
        cache[r.language].push(r.version);
      });
      
      this.pistonRuntimeCache = cache;
      this.pistonRuntimeFetchedAt = now;
    }

    // Căutăm alias-ul în cache-ul de limbaje instalate
    for (const alias of aliases) {
      if (this.pistonRuntimeCache[alias]) {
        return { language: alias, version: this.pistonRuntimeCache[alias][0] };
      }
    }
    
    throw new Error(`Limbajul '${aliases[0]}' nu este instalat în Docker.`);
  }

  /**
   * Evaluarea soluției trimise de utilizator
   */
  async judgeSubmission(problemId: string, userCode: string, language: string, userId: string) {
    // 1. Verificăm dacă utilizatorul există pentru a evita eroarea P2003 (Foreign Key)
    const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) {
      throw new ForbiddenException('Utilizator inexistent. Te rugăm să te re-loghezi.');
    }

    const problem = await this.prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) throw new NotFoundException('Problema nu a fost găsită');

    const testCases = (problem.testCases as any[]) || []; 
    const details: TestDetail[] = []; 
    let passedCount = 0;

    for (const test of testCases) {
      try {
        const cleanInput = (test.input || "").toString().replace(/\\n/g, '\n');
        
        // Apel către Piston Docker (nu mai folosește nimic local)
        const result = await this.callPiston(language, userCode, cleanInput);
        
        const actualOutput = result.stderr ? `EROARE: ${result.stderr}` : result.output;
        const expectedOutput = (test.output || "").toString().trim();
        const isCorrect = actualOutput === expectedOutput;

        if (isCorrect) passedCount++;

        details.push({
          input: test.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed: isCorrect
        });
      } catch (error: any) {
        // Marcăm eroarea fără a opri restul testelor
        details.push({
          input: test.input,
          expected: (test.output || "").toString(),
          actual: `EROARE MOTOR: ${error.message}`,
          passed: false
        });
      }
    }

    const isAllPassed = testCases.length > 0 && passedCount === testCases.length;

    // Salvarea finală în baza de date
    await this.prisma.submission.create({
  data: {
    problemId: String(problemId), // Asigură-te că ID-ul problemei este număr
    code: userCode,
    language: language,
    userId: String(userId),      // REPARARE CRITICĂ: Salvăm ca String
    status: isAllPassed ? "SUCCESS" : "WRONG_ANSWER", // Trebuie să fie exact "SUCCESS"
    output: `Rezultat: ${passedCount}/${testCases.length} teste trecute`,
    testResults: details as any 
  }
});

    return {
      success: isAllPassed,
      passed: passedCount,
      total: testCases.length,
      details
    };
  }

  async findAllByUser(userId: string) {
    return this.prisma.submission.findMany({
      where: { userId },
      include: { 
        problem: { select: { title: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOne(id: string, userId: string, role: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: { 
        problem: { select: { title: true } } 
      }
    });

    if (!submission) throw new NotFoundException('Submisia nu a fost găsită');
    if (submission.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Nu ai permisiunea de a vedea această submisie');
    }

    return submission;
  }
}