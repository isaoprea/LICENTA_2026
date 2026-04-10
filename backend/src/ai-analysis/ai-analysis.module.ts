import { Module } from '@nestjs/common';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysisController } from './ai-analysis.controller';
import { PrismaService } from '../prisma.service'; // Ajustează calea dacă e nevoie

@Module({
  controllers: [AiAnalysisController],
  providers: [AiAnalysisService, PrismaService],
  exports: [AiAnalysisService], 
})
export class AiAnalysisModule {}