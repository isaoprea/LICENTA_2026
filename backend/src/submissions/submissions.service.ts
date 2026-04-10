import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException 
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

  
  async callPiston(language: string, code: string, input: string) {
    const baseRoot = process.env.PISTON_URL_BASE || "http://127.0.0.1:2000/api/v2";
    const executeUrl = `${baseRoot}/execute`;
    const runtimesUrl = `${baseRoot}/runtimes`;

    const languageAliases: Record<string, string[]> = {
      javascript: ["node", "javascript", "nodejs"],
      python: ["python", "python3", "py"],
      cpp: ["cpp", "c++", "gcc"],
      rust: ["rust", "rs"],
      java: ["java"],
      csharp: ["csharp", "c#"],
      typescript: ["typescript", "ts"],
      
    };

    const searchAliases = languageAliases[language.toLowerCase()] || [language.toLowerCase()];
    
    try {
      const { language: pistonLanguage, version } = await this.getPistonVersion(runtimesUrl, searchAliases);
      
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
      throw new Error(`Conexiune motor eșuată: ${error.message}`);
    }
  }

  private async getPistonVersion(
    runtimesUrl: string,
    aliases: string[]
  ): Promise<{ language: string; version: string }> {
    const now = Date.now();
    
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

    for (const alias of aliases) {
      if (this.pistonRuntimeCache[alias]) {
        return { language: alias, version: this.pistonRuntimeCache[alias][0] };
      }
    }
    
    throw new Error(`Limbajul '${aliases[0]}' nu este instalat în Docker.`);
  }

 
  async judgeSubmission(
    problemId: string, 
    userCode: string, 
    language: string, 
    userId: string,
    assignmentId?: string
  ) {
    // --- DEBUG START ---
   

    const userExists = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!userExists) throw new ForbiddenException('Utilizator inexistent.');

    const problem = await this.prisma.problem.findUnique({ where: { id: problemId } });
    if (!problem) throw new NotFoundException('Problema nu a fost găsită');

    const testCases = (problem.testCases as any[]) || []; 
    const details: TestDetail[] = []; 
    let passedCount = 0;

    for (const test of testCases) {
      try {
        const cleanInput = (test.input || "").toString().replace(/\\n/g, '\n');
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
        details.push({
          input: test.input,
          expected: (test.output || "").toString(),
          actual: `EROARE MOTOR: ${error.message}`,
          passed: false
        });
      }
    }

    const isAllPassed = testCases.length > 0 && passedCount === testCases.length;
    console.log(`[DEBUG] Rezultat Teste: ${passedCount}/${testCases.length} trecute. Succes Total: ${isAllPassed}`);

    
    await this.prisma.submission.create({
      data: {
        problemId: String(problemId), 
        code: userCode,
        language: language,
        userId: String(userId),      
        assignmentId: assignmentId || null,
        status: isAllPassed ? "SUCCESS" : "WRONG_ANSWER", 
        output: `Rezultat: ${passedCount}/${testCases.length} teste trecute`,
        testResults: details as any 
      }
    });

  
    if (isAllPassed && assignmentId) {
      console.log(`[DEBUG] Se îndeplinesc condițiile pentru notificare (Succes & AssignmentId prezent).`);
      try {
        // 1. Update status temă
        await this.prisma.assignment.update({
          where: { id: assignmentId },
          data: { status: "SUCCESS" }
        });
        console.log(`[DEBUG] Statusul temei ${assignmentId} a fost actualizat la SUCCESS.`);

        // 2. Căutare profesor
        const assignmentInfo = await this.prisma.assignment.findUnique({
          where: { id: assignmentId },
          include: { classroom: { select: { teacherId: true } } }
        });

        if (!assignmentInfo) {
          console.error(`[DEBUG] EROARE: Nu am găsit tema cu ID-ul ${assignmentId} în baza de date.`);
        } else if (!assignmentInfo.classroom) {
          console.error(`[DEBUG] EROARE: Tema găsită nu este legată de nicio clasă! Verificați relația în DB.`);
        } else if (!assignmentInfo.classroom.teacherId) {
          console.error(`[DEBUG] EROARE: Clasa nu are un teacherId asociat.`);
        } else {
          // 3. Creare notificare
          const notif = await this.prisma.notification.create({
            data: {
              userId: assignmentInfo.classroom.teacherId,
              message: ` Studentul ${userExists.name} a finalizat tema: ${problem.title}`,
              type: 'ASSIGNMENT_SUCCESS'
            }
          });
          console.log(`[DEBUG] Notificare creată cu succes pentru Profesorul ID: ${assignmentInfo.classroom.teacherId}. ID Notificare: ${notif.id}`);
        }
      } catch (error) {
        console.error('[DEBUG] EROARE CRITICĂ în blocul de notificare:', error.message);
      }
    } else if (assignmentId && !isAllPassed) {
      console.log(`[DEBUG] Notificarea NU s-a trimis deoarece nu au trecut toate testele.`);
    } else if (!assignmentId) {
      console.log(`[DEBUG] Notificarea NU s-a trimis deoarece lipseste assignmentId (practică liberă).`);
    }

    console.log(`[DEBUG] === Sfârșit Proces Jurizare ===\n`);

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