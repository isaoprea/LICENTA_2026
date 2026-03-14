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

 
  @Get('practice') 
  async getPractice() {
    return this.problemsService.getPracticeProblems();
  }

  @Get('recruiter')
  async getRecruiterProblems()
  {
    return this.problemsService.getRecruiterProblems();
  }


  @Get('lesson/:lessonId')
  async getByLesson(@Param('lessonId', ParseIntPipe) lessonId: number) {
    return this.problemsService.getProblemByLesson(lessonId);
  }

 
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.problemsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  @Post() 
  async create(@Request() req: any, @Body() body: any) {
    const teacherId = req.user.userId || req.user.sub;
    return this.problemsService.create(teacherId, body);
  }
}