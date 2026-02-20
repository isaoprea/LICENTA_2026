// src/lessons/lessons.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findModulesByLanguage(language: string, userId: any) {
    console.log(`--- START DIAGNOSTICARE HARTĂ ---`);
    console.log(`Limbaj căutat: ${language}, User ID primit: ${userId}`);

    const modules = await this.prisma.module.findMany({
      where: { language: language.toLowerCase() },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: { problems: { select: { id: true } } },
        },
      },
      orderBy: { order: 'asc' },
    });

    let previousLessonCompleted = true;
    const processedModules: any[] = [];

    for (const mod of modules) {
      const processedLessons: any[] = [];
      for (const lesson of mod.lessons) {
        // Luăm ID-ul problemei asociate
        const problemId = lesson.problems[0]?.id;
        let isCompleted = false;

        if (problemId) {
          // VERIFICARE: Ce caută Prisma mai exact?
          console.log(`Căutăm succes pentru Lecția: "${lesson.title}" | Problem ID: ${problemId} | User ID: ${userId}`);

          const successSubmission = await this.prisma.submission.findFirst({
            where: {
              userId: String(userId),
              problemId: String(problemId),
              status: 'SUCCESS', // Trebuie să fie identic cu ce salvezi în SubmissionsService
            },
          });

          isCompleted = !!successSubmission;
          
          if (isCompleted) {
            console.log(`✅ GĂSIT! Userul a cucerit teritoriul: ${lesson.title}`);
          } else {
            console.log(`❌ NU S-A GĂSIT nicio submisiune "SUCCESS" în DB pentru acest user și această problemă.`);
          }
        }

        const isLocked = !previousLessonCompleted;
        processedLessons.push({ ...lesson, isCompleted, isLocked });
        previousLessonCompleted = isCompleted;
      }
      processedModules.push({ ...mod, lessons: processedLessons });
    }
    console.log(`--- SFÂRȘIT DIAGNOSTICARE ---`);
    return processedModules;
  }

  async findAll() {
    return this.prisma.lesson.findMany({ orderBy: { order: 'asc' }, include: { problems: true } });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: Number(id) },
      include: { problems: true, module: true }
    });
    if (!lesson) throw new NotFoundException('Lecția nu a fost găsită');
    return lesson;
  }
}