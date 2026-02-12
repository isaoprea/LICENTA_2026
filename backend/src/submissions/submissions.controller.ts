import { Controller, Post, Body, UseGuards, Request, Get, Param } from '@nestjs/common';
import { SubmissionsService, TestDetail } from './submissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  // Ruta existentă pentru trimiterea codului la evaluat
  @UseGuards(JwtAuthGuard)
  @Post('run')
  async runSubmission(
    @Body() data: { problemId: string; code: string; language: string },
    @Request() req
  ): Promise<{ success: boolean; passed: number; total: number; details: TestDetail[] }> {
    return await this.submissionsService.judgeSubmission(
      data.problemId,
      data.code,
      data.language,
      req.user.userId // Extras din JWT prin JwtAuthGuard
    );
  }

  // RUTA NOUĂ: Obține detaliile unei singure submisii
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getSubmission(@Param('id') id: string, @Request() req) {
    // Trimitem id-ul submisiei, dar și datele de identitate pentru verificare
    return await this.submissionsService.getOne(
      id, 
      req.user.userId, 
      req.user.role
    );
  }
}