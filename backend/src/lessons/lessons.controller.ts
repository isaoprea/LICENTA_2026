import { Controller, Get, Param, UseGuards, Request, UnauthorizedException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get('modules/:language')
  @UseGuards(JwtAuthGuard)
  async getModulesByLanguage(@Param('language') language: string, @Request() req) {
    // REPARARE: Strategia ta returnează "userId", deci îl extragem exact așa
    const id = req.user?.userId;

    if (!id) {
      console.error('[Controller] EROARE: userId nu a fost găsit în req.user:', req.user);
      throw new UnauthorizedException('ID utilizator lipsă din token');
    }

    console.log(`[Controller] Utilizator detectat: ${id}. Căutăm progres pentru ${language}`);
    
    return this.lessonsService.findModulesByLanguage(language, id);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }
}