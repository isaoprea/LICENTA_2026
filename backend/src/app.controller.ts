import { 
  Controller, 
  Post, 
  Body, 
  Get,
  NotFoundException, 
  UseGuards, 
  Request 
} from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AiService } from './ai/ai.service';

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService
  ) {}

  /**
   * Returnează statisticile generale ale utilizatorului (Lecții rezolvate, rata de succes).
   * Această rută rămâne aici deoarece este de uz general.
   */
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

  /**
   * Utilizează AI-ul pentru a explica erorile de compilare sau execuție.
   */
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