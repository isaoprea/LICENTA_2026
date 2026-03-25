import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Post('invite')
  async inviteCandidate(
    @Body() body: { email: string; name: string; assessmentId: string }
  ) {
    return this.assessmentsService.generateExamSession(
      body.email,
      body.name,
      body.assessmentId,
    );
  }

  @Get('session/:token')
  async getSession(@Param('token') token: string) {
    return this.assessmentsService.getExamByToken(token);
  }

  @Patch('session/:token/cheat')
  async reportCheating(
    @Param('token') token: string,
    @Body('warnings') warnings: number,
  ) {
    return this.assessmentsService.reportCheat(token, warnings);
  }

  @Patch('session/:token/submit')
  async submit(
    @Param('token') token: string,
    @Body() body: { 
      score: number; 
      finalCode: string; 
      codeHistory: any; 
      detectedPaste: boolean 
    },
  ) {
    return this.assessmentsService.submitExam(token, body);
  }

  @Get('recruiter/:id')
  async getRecruiterData(@Param('id') id: string) {
    return this.assessmentsService.getRecruiterSessions(id);
  }

  @Post()
  async createAssessment(@Body() body: any) {
    return this.assessmentsService.createAssessment(body);
  }

  @Get('recruiter-templates/:recruiterId')
  async getRecruiterTemplates(@Param('recruiterId') recruiterId: string) {
    return this.assessmentsService.getRecruiterTemplates(recruiterId);
  }
}