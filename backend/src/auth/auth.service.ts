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
        role: "USER" // Toți utilizatorii noi sunt USER implicit
      },
    });
  }

  async login(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    
    if (!user || !(await bcrypt.compare(pass, user.password))) {
      throw new UnauthorizedException('Date incorecte');
    }

    // MODIFICARE CRITICĂ: Includem rolul în payload
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
}