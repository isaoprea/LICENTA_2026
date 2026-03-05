import { Injectable, NotFoundException } from '@nestjs/common'; // Adăugat NotFoundException
import { PrismaService } from '../prisma.service';
import { ProblemType } from '@prisma/client';

@Injectable()
export class ProblemsService {
  constructor(private prisma: PrismaService) {}

  // 1. Găsește problema asociată unei lecții (Pentru sidebar-ul din imagini)
  async getProblemByLesson(lessonId: number) {
    const problem = await this.prisma.problem.findFirst({
      where: { 
        lessonId: lessonId,
        type: 'LESSON' 
      }
    });

    if (!problem) {
      throw new NotFoundException('Nu există nicio problemă asociată acestei lecții.');
    }
    return problem;
  }

  // 2. Găsește o singură problemă după ID-ul ei (Mutat din AppController)
  async findOne(id: string) {
    const problem = await this.prisma.problem.findUnique({
      where: { id }
    });

    if (!problem) {
      throw new NotFoundException('Problema nu a fost găsită.');
    }
    return problem;
  }

  // Metodele tale actuale (Rămân neschimbate)
  async getPracticeProblems() {
    return this.prisma.problem.findMany({
      where: { type: 'PRACTICE' },
      orderBy: { difficulty: 'asc' }
    });
  }

  async getTeacherLibrary(teacherId: string) {
    return this.prisma.problem.findMany({
      where: {
        OR: [
          { type: 'PRACTICE' }, 
          { authorId: teacherId } 
        ]
      }
    });
  }

  async create(teacherId: string, data: any) {
    return this.prisma.problem.create({
      data: {
        ...data,
        type: data.type || 'HOMEWORK', 
        authorId: teacherId
      }
    });
  }
}