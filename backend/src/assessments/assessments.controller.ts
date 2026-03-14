import { Controller, Post, Get, Body, Param, Patch } from '@nestjs/common';
import { AssessmentsService } from './assessments.service';
import { create } from 'axios';

@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  // Recrutorul trimite invitația
  // POST http://localhost:3000/assessments/invite
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

  // Candidatul accesează mediul de examen
  // GET http://localhost:3000/assessments/session/:token
  @Get('session/:token')
  async getSession(@Param('token') token: string) {
    return this.assessmentsService.getExamByToken(token);
  }

  // Sistemul raportează o tentativă de părăsire a paginii
  // PATCH http://localhost:3000/assessments/session/:token/cheat
  @Patch('session/:token/cheat')
  async reportCheating(
    @Param('token') token: string,
    @Body('warnings') warnings: number,
  ) {
    return this.assessmentsService.reportCheat(token, warnings);
  }

  // Candidatul apasă pe "Submit" la finalul testului
  // PATCH http://localhost:3000/assessments/session/:token/submit
  @Patch('session/:token/submit')
  async submit(
    @Param('token') token: string,
    @Body('score') score: number,
  ) {
    return this.assessmentsService.submitExam(token, score);
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