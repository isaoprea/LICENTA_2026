import { Controller, Post, Body, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard'; // Asigură-te că acest fișier există în folderul auth

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('register')
  register(@Body() body: { email: string; password: string; name: string }) {
    return this.auth.register(body.email, body.password, body.name);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.auth.login(body.email, body.password);
  }

  

  @UseGuards(JwtAuthGuard) // Această linie verifică token-ul JWT trimis de Frontend
  @Get('profile')
  getProfile(@Req() req) {
    // req.user este extras automat din token de către JwtStrategy
    // Returnează datele de profil (nume, streak etc.)
    return req.user; 
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats/me')
  async getMyStats(@Req() req) {
    // Aici apelăm o metodă din service care calculează statisticile utilizatorului
    // req.user.id (sau sub) este ID-ul extras din token
    return this.auth.getUserStats(req.user.id);
  }
}