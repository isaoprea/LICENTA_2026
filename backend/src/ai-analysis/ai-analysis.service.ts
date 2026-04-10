import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import axios, { AxiosError } from 'axios';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AiAnalysisService {
  constructor(private prisma: PrismaService) {}

  async analyzeUserCode(userId: string) {
    // 0. Verificare de siguranță: Dacă userId lipsește, oprim totul aici
    if (!userId) {
      console.error('--- EROARE CRITICĂ: userId este undefined în Service! ---');
      throw new InternalServerErrorException('ID-ul utilizatorului lipsește.');
    }

    // 1. Căutăm ultimele 5 submisii de succes ale acestui utilizator
    const recentSubmissions = await this.prisma.submission.findMany({
      where: {
        userId: userId,
        status: 'SUCCESS',
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Dacă utilizatorul nu are cod de succes, aruncăm o eroare 404 (NotFound)
    if (!recentSubmissions || recentSubmissions.length === 0) {
      throw new NotFoundException("Nu ai destul cod scris pentru o analiză. Mai rezolvă niște probleme!");
    }

    // 2. Lipim codul pentru a-l trimite la procesat
    const megaCode = recentSubmissions.map(s => s.code).join('\n\n--- NEXT ---\n\n');

    try {
      // 3. Trimitem datele către serverul de Python (Robotul AI)
      const response = await axios.post(
        'http://localhost:8000/analyze',
        { code: megaCode, language: 'mixed' },
        { timeout: 30000 }, // 30s timeout — modelul CodeBERT e lent
      );

      const aiData = response.data;

      // LOG: Monitorizăm ce primim de la AI în terminalul de NestJS
      console.log(`--- DATE AI PENTRU USER ${userId} ---`, aiData);

      // 4. Mapează câmpurile Python → NestJS
      // Python returnează: { logic, cleanCode, efficiency, versatility }
      // NestJS/Prisma așteaptă: { logicScore, cleanCodeScore, efficiencyScore, versatilityScore, summary }
      const avg = (aiData.logic + aiData.cleanCode + aiData.efficiency + aiData.versatility) / 4;
      const mapped = {
        logicScore:       aiData.logic,
        cleanCodeScore:   aiData.cleanCode,
        efficiencyScore:  aiData.efficiency,
        versatilityScore: aiData.versatility,
        summary: avg >= 8
          ? 'Cod excelent! Logică clară, eficient și ușor de întreținut.'
          : avg >= 6
            ? 'Cod bun, cu loc de îmbunătățire în structură și eficiență.'
            : 'Cod funcțional, dar necesită refactorizare și optimizare.',
      };

      // 5. Salvăm sau Actualizăm rezultatele în baza de date (Upsert)
      return await this.prisma.aiAnalysis.upsert({
        where: { userId },
        update: mapped,
        create: { userId, ...mapped },
      });

    } catch (error) {
      console.error('--- EROARE ÎN AI-ANALYSIS SERVICE ---');

      const axiosError = error as AxiosError;

      if (axiosError.code === 'ECONNREFUSED') {
        // Python server oprit
        throw new InternalServerErrorException(
          'Serverul AI nu este pornit. Rulează: uvicorn main:app --reload'
        );
      }

      if (axiosError.response) {
        // Eroarea vine de la Python (ex: cod invalid, server oprit)
        console.error('Eroare Python API:', axiosError.response.data);
        throw new InternalServerErrorException('Robotul AI a întâmpinat o problemă la procesare.');
      }

      // Eroarea vine probabil de la Prisma (ex: coloana lipsește din DB)
      console.error('Eroare DB/Prisma:', (error as Error).message);
      throw new InternalServerErrorException('Analiza a fost generată, dar nu am putut să o salvăm în profilul tău.');
    }
  }
}