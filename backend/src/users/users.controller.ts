import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    // În strategia ta JWT, "sub" devine probabil "userId" sau rămâne "sub"
    return this.usersService.getProfile(req.user.userId || req.user.sub);
  }
}