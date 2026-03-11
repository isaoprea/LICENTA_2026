import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClassroomsService } from './classrooms.service';

@Controller('assignments')
export class AssignmentsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  getAssignmentById(@Param('id') id: string, @Request() req) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    const role = req.user.role || 'USER';
    return this.classroomsService.getAssignmentByIdForUser(id, userId, role);
  }
}
