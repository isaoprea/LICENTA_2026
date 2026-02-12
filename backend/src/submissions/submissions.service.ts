import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import axios from 'axios';

// 1. Exportăm interfața pentru a fi vizibilă și în Controller
export interface TestDetail {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

@Injectable()
export class SubmissionsService {
  constructor(private prisma: PrismaService) {}

  async callPiston(language: string, code: string, input: string) {
    const url = "https://emkc.org/api/v2/piston/execute";
    const versions: Record<string, string> = { 
      javascript: "18.15.0", 
      python: "3.10.0",
      java: "17.0.2",
      cpp: "10.2.0" // Suport pentru C++
    };

    const payload = {
      language: language,
      version: versions[language] || "latest",
      files: [{ content: code }],
      stdin: input
    };

    const response = await axios.post(url, payload);
    // Returnăm output-ul curățat de spații inutile
    return response.data.run.output.trim(); 
  }

  async judgeSubmission(problemId: string, userCode: string, language: string, userId: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { id: problemId }
    });

    if (!problem) throw new NotFoundException('Problema nu a fost găsită');

    const testCases = (problem.testCases as any[]) || []; 
    const details: TestDetail[] = []; 
    let passedCount = 0;

    for (const test of testCases) {
      try {
        // REPARARE: Transformăm textul "\n" în linie nouă reală pentru C++
        const cleanInput = test.input.toString().replace(/\\n/g, '\n');

        const actualOutput = await this.callPiston(language, userCode, cleanInput);
        const expectedOutput = (test.output || "").toString().trim();
        const isCorrect = actualOutput === expectedOutput;

        if (isCorrect) passedCount++;

        details.push({
          input: test.input,
          expected: expectedOutput,
          actual: actualOutput,
          passed: isCorrect
        });
      } catch (error) {
        details.push({
          input: test.input,
          expected: test.output || "",
          actual: "EROARE LA EXECUTIE",
          passed: false
        });
      }
    }

    const isAllPassed = testCases.length > 0 && passedCount === testCases.length;

    // REPARARE EROARE TIP: Adăugăm 'as any' pentru a permite salvarea JSON-ului
    await this.prisma.submission.create({
      data: {
        problemId: problemId,
        code: userCode,
        language: language,
        userId: userId, 
        status: isAllPassed ? "SUCCESS" : "WRONG_ANSWER",
        output: `Trecute: ${passedCount}/${testCases.length}`,
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

  async getOne(id: string, userId: string, role: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id },
      include: { 
        problem: {
          select: { title: true } 
        } 
      }
    });

    if (!submission) {
      throw new NotFoundException('Submisia nu a fost găsită');
    }

    // Verificăm drepturile de acces
    if (submission.userId !== userId && role !== 'ADMIN') {
      throw new ForbiddenException('Nu ai permisiunea de a vedea această submisie');
    }

    return submission;
  }
}