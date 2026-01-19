import { Injectable, NotFoundException } from '@nestjs/common';
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
      java: "17.0.2" 
    };

    const payload = {
      language: language,
      version: versions[language] || "latest",
      files: [{ content: code }],
      stdin: input
    };

    const response = await axios.post(url, payload);
    return response.data.run.output.trim(); 
  }

  // MODIFICARE: Adăugăm userId ca al patrulea parametru
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
        const actualOutput = await this.callPiston(language, userCode, test.input);
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

    // MODIFICARE: Salvăm userId în baza de date
    await this.prisma.submission.create({
      data: {
        problemId: problemId,
        code: userCode,
        language: language,
        userId: userId, // Legătura critică cu utilizatorul logat
        status: isAllPassed ? "SUCCESS" : "WRONG_ANSWER",
        output: `Trecute: ${passedCount}/${testCases.length}`,
      }
    });

    return {
      success: isAllPassed,
      passed: passedCount,
      total: testCases.length,
      details
    };
  }
}