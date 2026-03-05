// src/lessons/lessons.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  async findModulesByLanguage(language: string, userId: any) {
    
    const modules = await this.prisma.module.findMany({
      where: { language: language.toLowerCase() },
      include: {
        lessons: {
          orderBy: { order: 'asc' },
          include: {
             problems: {
               where : {type: 'LESSON'},
               select: { id :true   }
             }
            },
        },
      },
      orderBy: { order: 'asc' },
    });

    let previousLessonCompleted = true;
    const processedModules: any[] = [];

    for (const mod of modules) {
      const processedLessons: any[] = [];
      for (const lesson of mod.lessons) {
        const problemId = lesson.problems[0]?.id;
        let isCompleted = false;

        if (problemId) {

          const successSubmission = await this.prisma.submission.findFirst({
            where: {
              userId: String(userId),
              problemId: String(problemId),
              status: 'SUCCESS', 
            },
          });

          isCompleted = !!successSubmission;
          
          
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
    return this.prisma.lesson.findMany({ 
      orderBy: { order: 'asc' },
       include: { 
        problems: {where :  {type : 'LESSON'}}
       }
      });
  }

  async findOne(id: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: Number(id) },
      include: {
         problems: {where :  {type : 'LESSON'}},
         module: true }
    });
    if (!lesson) throw new NotFoundException('Lecția nu a fost găsită');
    return lesson;
  }
}