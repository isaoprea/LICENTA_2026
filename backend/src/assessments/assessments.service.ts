import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { EmailService } from '../email/email.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AssessmentsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService
  ) {}

  async generateExamSession(candidateEmail: string, candidateName: string, assessmentId: string) {
    const token = uuidv4(); 
    
    const session = await this.prisma.examSession.create({
      data: {
        candidateEmail,
        candidateName,
        token,
        assessmentId,
        status: 'PENDING'
      }
    });

    const publicFrontendUrl = "https://alden-inflectional-coretta.ngrok-free.dev/exam/${token}"; //temporar sa vad daca merge link ul
    const magicLink = `${publicFrontendUrl}/exam/${session.token}`;

    try {
      await this.emailService.sendInviteEmail(candidateEmail, candidateName, magicLink);
    } catch (error) {
      console.error(error);
    }

    return { 
      message: "Sesiune creată și invitație trimisă!", 
      token: session.token,
      magicLink: magicLink 
    };
  }

  async getExamByToken(token: string) {
    const session = await this.prisma.examSession.findUnique({
      where: { token },
      include: {
        assessment: {
          select: {
            id: true,
            title: true,
            companyName: true,
            timeLimit: true,
            language: true,
            problems: {
              select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
              }
            }
          }
        }
      }
    });

    if (!session) {
      throw new NotFoundException('Sesiunea de examen nu a fost găsită.');
    }
    
    return session;
  }

  async reportCheat(token: string, warnings: number) {
    return this.prisma.examSession.update({
      where: { token },
      data: { 
        cheatWarnings: warnings,
        status: warnings >= 3 ? 'SUSPENDED_CHEATING' : 'IN_PROGRESS'
      }
    });
  }

 async submitExam(token: string, data: { score: number, finalCode: string, codeHistory: any, detectedPaste: boolean }) {
    const incrementWarning = data.detectedPaste ? 1 : 0;

    return this.prisma.examSession.update({
      where: { token },
      data: {
        score: data.score,
        finalCode: data.finalCode,       
        codeHistory: data.codeHistory,   
        status: 'COMPLETED',
        completedAt: new Date(),
        cheatWarnings: {
          increment: incrementWarning    
        }
      }
    });
  }

  async getRecruiterSessions(recruiterId: string) {
    return this.prisma.examSession.findMany({
      where: {
        assessment: { recruiterId: recruiterId }
      },
      include: {
        assessment: true 
      },
      orderBy: { startedAt: 'desc' }
    });
  }

  async createAssessment(data: { title: string, companyName: string, timeLimit: number, language: string, recruiterId: string, problemIds: string[] }) {
    return this.prisma.assessment.create({
      data: {
        title: data.title,
        companyName: data.companyName,
        timeLimit: data.timeLimit,
        language: data.language,
        recruiterId: data.recruiterId,
        problems: {
          connect: data.problemIds.map((id) => ({ id }))
        }
      }
    });
  }

  async getRecruiterTemplates(recruiterId: string) {
    return this.prisma.assessment.findMany({
      where: { recruiterId },
      include: {
        problems: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}