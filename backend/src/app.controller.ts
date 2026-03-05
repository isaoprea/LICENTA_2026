import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  NotFoundException, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SubmissionsService } from './submissions/submissions.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AiService } from './ai/ai.service';

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly submissionsService: SubmissionsService,
    private readonly aiService: AiService
  ) {}

  /*  Această rută intră în conflict cu ProblemsController
  @Get('problems')
  async getProblems() {
    return this.prisma.problem.findMany();
  }
  */

  /*  Aceasta este "vinovata" pentru eroarea 404! 
     Ea crede că "practice" din URL este un ID și caută în baza de date după el.
  @Get('problems/:id')
  async getProblem(@Param('id') id: string) {
    const problem = await this.prisma.problem.findUnique({ where: { id } });
    if (!problem) throw new NotFoundException('Problema nu a fost găsită');
    return problem;
  }
  */

  @UseGuards(JwtAuthGuard) 
  @Post('submissions/run')
  async runSubmission(
    @Body() data: { problemId: string, code: string, language: string }, 
    @Request() req
  ) {
    return this.submissionsService.judgeSubmission(
      data.problemId,
      data.code,
      data.language,
      req.user.userId 
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('submissions')
  async getMySubmissions(@Request() req) {
    return this.prisma.submission.findMany({
      where: { userId: req.user.userId },
      include: { problem: true },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('user/stats')
  async getUserStats(@Request() req) {
    const userId = req.user.userId;

    const totalAttempts = await this.prisma.submission.count({
      where: { userId }
    });

    const acceptedSubmissions = await this.prisma.submission.findMany({
      where: { 
        userId,
        status: { in: ['SUCCESS', 'success'] }
      },
      distinct: ['problemId'],
      select: { problemId: true }
    });

    const solvedCount = acceptedSubmissions.length;

    return {
      totalAttempts,
      solvedCount,
      successRate: totalAttempts > 0 
        ? Math.round((solvedCount / totalAttempts) * 100) 
        : 0
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('ai/explain')
  async explainError(@Body() data: { problemId: string, code: string, error: string }) {
    const problem = await this.prisma.problem.findUnique({ 
      where: { id: data.problemId } 
    });

    if (!problem) {
      throw new NotFoundException('Problema specificată nu a fost găsită în baza de date.');
    }

    return this.aiService.cereAjutor(problem.title, data.code, data.error);
  }
}