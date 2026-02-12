import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PrismaService } from './prisma.service'; 
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { AdminGuard } from './auth/admin.guard';
@Controller('admin')
export class AdminController {
  constructor(private prisma: PrismaService) {}

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('problems')
  async createProblem(@Body() data: any) {
    return this.prisma.problem.create({
      data: {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        testCases: data.testCases, 
        // ADAUGĂ ACEASTĂ LINIE:
        // Ne asigurăm că legăm problema de o lecție dacă este trimis un ID
        lessonId: data.lessonId ? Number(data.lessonId) : null,
      },
    });
  }
}