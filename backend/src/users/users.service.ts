import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    // 1. Preluăm datele de bază ale utilizatorului
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true }
    });

    // 2. Preluăm toate modulele cu lecțiile și problemele lor pentru a calcula progresul
    const modules = await this.prisma.module.findMany({
      include: {
        lessons: {
          include: { problems: true }
        }
      }
    });

    // 3. Calculăm progresul per modul
    const progress = await Promise.all(modules.map(async (mod) => {
      const allProblemIds = mod.lessons.flatMap(l => l.problems.map(p => p.id));
      
      // Numărăm problemele rezolvate cu succes (unice)
      const solvedCount = await this.prisma.submission.findMany({
        where: {
          userId,
          status: 'SUCCESS',
          problemId: { in: allProblemIds }
        },
        distinct: ['problemId']
      });

      const total = allProblemIds.length;
      const completed = solvedCount.length;

      return {
        moduleTitle: mod.title,
        language: mod.language,
        totalProblems: total,
        completedProblems: completed,
        percentage: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    }));

    return { ...user, progress };
  }
}