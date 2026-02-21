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

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly submissionsService: SubmissionsService,
  ) {}

  @Get('problems')
  async getProblems() {
    return this.prisma.problem.findMany();
  }

  @Get('problems/:id')
  async getProblem(@Param('id') id: string) {
    const problem = await this.prisma.problem.findUnique({ where: { id } });
    if (!problem) throw new NotFoundException('Problema nu a fost găsită');
    return problem;
  }

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

  // --- RUTĂ SINCRONIZATĂ PENTRU DASHBOARD ---
  @UseGuards(JwtAuthGuard)
  @Get('user/stats')
  async getUserStats(@Request() req) {
    const userId = req.user.userId;

    // 1. Numărăm totalul de încercări
    const totalAttempts = await this.prisma.submission.count({
      where: { userId }
    });

    // 2. Numărăm problemele unice rezolvate cu succes
    const acceptedSubmissions = await this.prisma.submission.findMany({
      where: { 
        userId,
        status: { in: ['SUCCESS', 'success'] } // Sincronizat cu SubmissionsService
      },
      distinct: ['problemId'],
      select: { problemId: true }
    });

    const solvedCount = acceptedSubmissions.length;

    // 3. Returnăm obiectul exact cum îl așteaptă Frontend-ul
    return {
      totalAttempts,
      solvedCount,
      successRate: totalAttempts > 0 
        ? Math.round((solvedCount / totalAttempts) * 100) 
        : 0
    };
  }
}