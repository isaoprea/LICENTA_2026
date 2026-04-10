import { Controller, Post, UseGuards, Request, Param } from '@nestjs/common'; // Am adăugat Param aici
import { AiAnalysisService } from './ai-analysis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai-analysis')
export class AiAnalysisController {
  constructor(private readonly aiAnalysisService: AiAnalysisService) {}

  // RUTA TA EXISTENTĂ (Neschimbată)
  @UseGuards(JwtAuthGuard)
  @Post('generate')
  async generateProfile(@Request() req) {
    const userIdFromJwt = req.user.userId; 

    console.log('Trimit către service ID-ul:', userIdFromJwt);

    if (!userIdFromJwt) {
      throw new Error('Eroare: userId lipsește din obiectul req.user!');
    }

    return this.aiAnalysisService.analyzeUserCode(userIdFromJwt);
  }

  // ==========================================
  // RUTA NOUĂ DE TEST (FĂRĂ GUARD)
  // ==========================================
  @Post('generate/:userId')
  async generateTest(@Param('userId') userId: string) {
    console.log('TEST - Trimit către service ID-ul din URL:', userId);
    
    // Folosim numele exact: aiAnalysisService
    return this.aiAnalysisService.analyzeUserCode(userId);
  }
}