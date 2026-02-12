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

  /**
   * Returnează lista tuturor problemelor.
   * Această rută este publică.
   */
  @Get('problems')
  async getProblems() {
    return this.prisma.problem.findMany();
  }

  /**
   * Returnează detaliile unei singure probleme după ID.
   * Această rută este publică.
   */
  @Get('problems/:id')
  async getProblem(@Param('id') id: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { id },
    });
    if (!problem) throw new NotFoundException('Problema nu a fost găsită');
    return problem;
  }

  /**
   * Evaluează codul trimis de utilizator.
   * PROTEJATĂ: Salvează submisia legată de ID-ul utilizatorului logat.
   */
  @UseGuards(JwtAuthGuard) 
  @Post('submissions/run')
  async runSubmission(
    @Body() data: { problemId: string, code: string, language: string }, 
    @Request() req
  ) {
    // req.user.userId vine din strategia JWT (jwt.strategy.ts)
    return this.submissionsService.judgeSubmission(
      data.problemId,
      data.code,
      data.language,
      req.user.userId 
    );
  }

  /**
   * Returnează istoricul de submisii.
   * PROTEJATĂ: Filtrează baza de date pentru a returna DOAR datele utilizatorului curent.
   * Aceasta elimină problema vizualizării celor 14 încercări vechi de către utilizatorii noi.
   */
  @UseGuards(JwtAuthGuard)
  @Get('submissions')
  async getMySubmissions(@Request() req) {
    // Debugging opțional: scoate comentariul de mai jos pentru a vedea cine cere datele în terminal
    // console.log("Cerere istoric pentru user:", req.user.userId);

    return this.prisma.submission.findMany({
      where: {
        userId: req.user.userId 
      },
      include: {
        problem: true
      },
      orderBy: { 
        createdAt: 'desc' 
      },
      take: 50 // Limităm la ultimele 50 pentru performanță
    });
  }

  /**
   * Returnează statisticile utilizatorului logat (probleme rezolvate + încercări totale)
   * PROTEJATĂ: Calculează DOAR pentru utilizatorul curent
   */
  @UseGuards(JwtAuthGuard)
  @Get('user/stats')
  async getUserStats(@Request() req) {
    const userId = req.user.userId;

    // Total încercări pentru acest user
    const totalSubmissions = await this.prisma.submission.count({
      where: { userId }
    });

    // Probleme unice rezolvate (Accepted) pentru acest user
    const acceptedSubmissions = await this.prisma.submission.findMany({
      where: { 
        userId,
        status: 'Accepted'
      },
      distinct: ['problemId'],
      select: { problemId: true }
    });

    return {
      totalSubmissions,
      solvedProblems: acceptedSubmissions.length
    };
  }
}