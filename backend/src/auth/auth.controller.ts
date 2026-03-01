import { Controller, Post, Body, Get, UseGuards, Request, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard'; 
import { PrismaService } from '../prisma/prisma.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly prisma: PrismaService 
  ) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; name: string }) {
    return this.auth.register(body.email, body.password, body.name);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id; 

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,  
        role: true,
        streak: true
      }
    });

    return user;
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/me')
  async getMyStats(@Req() req: any) {
    const userId = req.user.userId || req.user.sub || req.user.id;
    return this.auth.getUserStats(userId);
  }
}