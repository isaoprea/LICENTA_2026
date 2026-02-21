import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async register(email: string, pass: string, name: string) {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email deja folosit');

    const hashedPassword = await bcrypt.hash(pass, 10);
    return this.prisma.user.create({
      data: { 
        email, 
        password: hashedPassword, 
        name,
        role: "USER",
        streak: 0 // Inițializăm foculețele la 0
      },
    });
  }

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Date incorecte');
    }

    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      name: user.name
    };

    return { 
      access_token: this.jwtService.sign(payload) 
    };
  }

  // --- METODA NOUĂ PENTRU STATISTICI REALE ---
  async getUserStats(userId: string) {
    // 1. Numărăm problemele rezolvate cu succes (status 'success')
    // Notă: Verifică dacă în schema.prisma tabelul se numește 'submission' sau 'solution'
    const solvedCount = await this.prisma.submission.count({
      where: {
        userId: userId,
        status: {
          in: ['SUCCESS', 'success'] 
        }
      },
    });

    // 2. Numărăm toate încercările făcute de utilizator
    const totalAttempts = await this.prisma.submission.count({
      where: {
        userId: userId,
      },
    });

    // 3. Calculăm rata de succes
    const successRate = totalAttempts > 0 
      ? Math.round((solvedCount / totalAttempts) * 100) 
      : 0;

    return {
      solvedCount,
      totalAttempts,
      successRate,
    };
  }

  // --- METODA PENTRU PROFIL (Nume + Streak) ---
  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, streak: true, email: true, role: true }
    });
  }
}