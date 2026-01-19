import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { SubmissionsService, TestDetail } from './submissions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

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
      req.user.userId // Adaugă userId extras din JWT
    );
  }
}