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
        streak: 0 
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

  async getUserStats(userId: string) {
    
    const solvedCount = await this.prisma.submission.count({
      where: {
        userId: userId,
        status: {
          in: ['SUCCESS', 'success'] 
        }
      },
    });

    const totalAttempts = await this.prisma.submission.count({
      where: {
        userId: userId,
      },
    });

    const successRate = totalAttempts > 0 
      ? Math.round((solvedCount / totalAttempts) * 100) 
      : 0;

    return {
      solvedCount,
      totalAttempts,
      successRate,
    };
  }

  async findUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, streak: true, email: true, role: true }
    });
  }
}