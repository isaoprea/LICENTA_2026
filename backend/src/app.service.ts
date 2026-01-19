import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import * as vm from 'vm'; // Modul nativ Node.js pentru executie izolata

// Simple deep equality for primitives, arrays, and plain objects
function isEqual(a: any, b: any): boolean {
  if (a === b) return true;

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((v, i) => isEqual(v, b[i]));
  }

  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    return aKeys.length === bKeys.length && aKeys.every((k) => isEqual(a[k], b[k]));
  }

  // Fallback to string comparison to handle number/string mismatch like 4 vs "4"
  return String(a) === String(b);
}

function parseValue(raw: any): any {
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return raw;
      }
    }
  }
  return raw;
}

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
        // Acceptam atat input cat si args; args este recomandat pentru multiple argumente
        const rawArgs = Array.isArray(test.args)
          ? test.args
          : typeof test.input !== 'undefined'
            ? [test.input]
            : [];

        const args = rawArgs.map(parseValue);
        const expected = parseValue(test.expected ?? test.output);

        // Cream un context izolat pentru fiecare test case
        const context = { args, result: null } as any;
        vm.createContext(context);

        // Invaluim codul utilizatorului intr-o functie solve(...) care primeste toate argumentele
        const scriptContent = `
          const solve = (...args) => { 
            ${submission.code}
          };
          result = solve(...args);
        `;

        const script = new vm.Script(scriptContent);
        script.runInContext(context, { timeout: 2000 }); // Limita de 2 secunde

        if (!isEqual(context.result, expected)) {
          allPassed = false;
          finalOutput = `Esuat la input: ${JSON.stringify(args)}. Asteptat: ${JSON.stringify(expected)}, Primit: ${JSON.stringify(context.result)}`;
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

    } catch (error: any) {
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