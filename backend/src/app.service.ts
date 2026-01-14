import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as vm from 'vm'; // Modul nativ Node.js pentru executie izolata

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async evaluateSubmission(submissionId: string) {
    const submission = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      include: { problem: true },
    });

    if (!submission) return;

    const testCases = submission.problem.testCases as any[];
    let allPassed = true;
    let finalOutput = "";

    try {
      for (const test of testCases) {
        // Cream un context izolat pentru fiecare test case
        const context = { input: test.input, result: null };
        vm.createContext(context);

        // Invaluim codul utilizatorului intr-o functie care primeste input-ul
        const scriptContent = `
          const solve = (input) => { 
            ${submission.code} 
          };
          result = solve(input);
        `;

        const script = new vm.Script(scriptContent);
        script.runInContext(context, { timeout: 2000 }); // Limita de 2 secunde

        if (String(context.result) !== String(test.output)) {
          allPassed = false;
          finalOutput = `Eșuat la input: ${test.input}. Așteptat: ${test.output}, Primit: ${context.result}`;
          break;
        }
      }

      // Actualizam baza de date cu rezultatul
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: allPassed ? 'SUCCESS' : 'WRONG_ANSWER',
          output: allPassed ? 'Toate testele au trecut!' : finalOutput,
        },
      });

    } catch (error) {
      await this.prisma.submission.update({
        where: { id: submissionId },
        data: {
          status: 'ERROR',
          output: `Eroare de compilare/execuție: ${error.message}`,
        },
      });
    }
  }
}