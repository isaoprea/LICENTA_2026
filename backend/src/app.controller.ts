import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { AppService } from './app.service'; // Importul necesar pentru serviciul de evaluare

@Controller()
export class AppController {
  // Injectăm serviciile necesare: Prisma pentru DB și AppService pentru logica de evaluare
  constructor(
    private readonly prisma: PrismaService,
    private readonly appService: AppService,
  ) {}

  // Endpoint pentru a lista toate problemele disponibile
  @Get('problems')
  async getProblems() {
    return this.prisma.problem.findMany();
  }

  // Endpoint pentru trimiterea codului către evaluare
  @Post('submissions')
  async submitCode(@Body() data: { problemId: string, code: string, language: string }) {
    // 1. Salvăm submisia în baza de date cu statusul inițial PENDING
    const submission = await this.prisma.submission.create({
      data: {
        problemId: data.problemId,
        code: data.code,
        language: data.language,
        status: 'PENDING',
      },
    });

    // 2. Declanșăm procesul de evaluare în fundal (fără await pentru a nu bloca răspunsul HTTP)
    this.appService.evaluateSubmission(submission.id);

    // 3. Returnăm imediat obiectul submisiei către Frontend/Mobile
    return submission;
  }

  // Endpoint pentru a verifica statusul unei submisii (Polling)
  @Get('submissions/:id')
  async getStatus(@Param('id') id: string) {
    return this.prisma.submission.findUnique({
      where: { id },
    });
  }
}