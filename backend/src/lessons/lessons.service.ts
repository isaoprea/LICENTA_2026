import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  // Returnează toate lecțiile și include lista de probleme asociate
  async findAll() {
    return this.prisma.lesson.findMany({
      orderBy: { order: 'asc' },
      include: { problems: true } 
    });
  }

  // Caută o lecție specifică. Transformăm ID-ul din string în number
  async findOne(id: string) {
    const numId = Number(id);
    
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: numId },
      include: { problems: true } 
    });

    if (!lesson) {
      throw new NotFoundException('Lecția nu a fost găsită');
    }
    return lesson;
  }
}