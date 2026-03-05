import { 
  Controller, Get, Post, Body, Param, 
  UseGuards, Request, ParseIntPipe 
} from '@nestjs/common'; // Adăugat Param și ParseIntPipe
import { ProblemsService } from './problems.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('problems')
export class ProblemsController {
  constructor(private readonly problemsService: ProblemsService) {}

  // 1. Runda de practică (Arena)
  @Get('practice') 
  async getPractice() {
    return this.problemsService.getPracticeProblems();
  }

  // 2. PROBLEMA PENTRU LECȚIE (Rezolvă sidebar-ul gol din imagine)
  // Folosim ParseIntPipe pentru a converti automat ID-ul din string în number
  @Get('lesson/:lessonId')
  async getByLesson(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.problemsService.getProblemByLesson(lessonId);
  }

  // 3. DETALII PROBLEMĂ DUPĂ ID (Mutat din AppController)
  // Atenție: Aceasta trebuie să fie SUB 'practice' și 'lesson'
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.problemsService.findOne(id);
  }

  // 4. CREARE PROBLEMĂ (Doar pentru profesori)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @Post() 
  async create(@Request() req: any, @Body() body: any) {
    const teacherId = req.user.userId || req.user.sub;
    return this.problemsService.create(teacherId, body);
  }
}