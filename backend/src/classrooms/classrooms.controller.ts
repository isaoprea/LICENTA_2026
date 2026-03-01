import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('classrooms')
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  create(@Body() createClassroomDto: CreateClassroomDto) {
    return this.classroomsService.create(createClassroomDto);
  }

  @Get('teacher/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  getTeacherClasses(@Param('id') id: string) {
    return this.classroomsService.getTeacherClasses(id);
  }

  @Get(':id/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  getClassroomStats(@Param('id') id: string) {
    return this.classroomsService.getClassroomStats(id);
  }

  @Post('assignment')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  createAssignment(@Body() dto: CreateAssignmentDto) {
    return this.classroomsService.createAssignments(dto);
  }

  @Patch('assignment/:id/grade')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  setGrade(
    @Param('id') id: string, 
    @Body('grade') grade: number
  ) {
    return this.classroomsService.setGrade(id, grade);
  }

  @Get('my-assignments')
  @UseGuards(JwtAuthGuard)
  getMyAssignments(@Request() req) {
    const userId = req.user.userId || req.user.sub;
    return this.classroomsService.getStudentAssignments(userId);
  }

  @Post('join')
  @UseGuards(JwtAuthGuard)
  async joinClassroom(@Request() req, @Body('inviteCode') inviteCode:string)
  {
    const userId = req.user.userId || req.user.sub || req.user.id;
    return this.classroomsService.joinClassroom({ inviteCode, userId });
  }

  @Get('student/me')
@UseGuards(JwtAuthGuard)
async getMyClassrooms(@Request() req) {
  const userId = req.user.userId || req.user.sub || req.user.id;
  return this.classroomsService.getStudentClassrooms(userId);
}
}