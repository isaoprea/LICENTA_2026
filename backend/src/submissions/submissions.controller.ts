import { Controller, Post, Body } from '@nestjs/common';
import { SubmissionsService, TestDetail } from './submissions.service';

@Controller('submissions')
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) {}

  @Post('run')
  async runCode(
    @Body() body: { problemId: string; code: string; language: string }
  ): Promise<{ success: boolean; passed: number; total: number; details: TestDetail[] }> {
    return await this.submissionsService.judgeSubmission(
      body.problemId,
      body.code,
      body.language
    );
  }
}