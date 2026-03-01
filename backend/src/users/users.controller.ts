import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from "../auth/roles.decorator";
import { PrismaService } from "../prisma.service";
import { RolesGuard } from '../auth/roles.guard';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private prisma: PrismaService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return this.usersService.getProfile(req.user.userId || req.user.sub);
  }

  @Get('students')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('TEACHER')
  async getAllStudents() {
    return this.prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: { 
        id: true, 
        name: true, 
        email: true 
      }
    });
  }
}