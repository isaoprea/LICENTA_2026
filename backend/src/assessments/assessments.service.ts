import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AssessmentsService {
  constructor(private prisma: PrismaService) {}

  // 1. Generează o sesiune nouă pentru un candidat (Ruta de invitație)
  async generateExamSession(candidateEmail: string, candidateName: string, assessmentId: string) {
    const token = uuidv4(); 
    
    const session = await this.prisma.examSession.create({
      data: {
        candidateEmail,
        candidateName,
        token,
        assessmentId,
      }
    });

    return { 
      message: "Sesiune creată cu succes", 
      token: session.token,
      magicLink: `http://localhost:5173/exam/${session.token}` 
    };
  }

  // 2. Aduce datele examenului pe baza token-ului (Sigur, fără erori 500)
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
            problems: {
              select: {
                id: true,
                title: true,
                description: true,
                difficulty: true,
                type: true,
                testCases: true // Opțional: poți scoate asta dacă nu vrei să fie vizibile în browser
              }
            }
          }
        }
      }
    });

    if (!session) {
      throw new NotFoundException('Sesiunea de examen nu a fost găsită sau link-ul este invalid.');
    }
    
    return session;
  }

  // 3. Raportare trișat (Modifică statusul dacă e cazul)
  async reportCheat(token: string, warnings: number) {
    return this.prisma.examSession.update({
      where: { token },
      data: { 
        cheatWarnings: warnings,
        status: warnings >= 3 ? 'SUSPENDED_CHEATING' : 'IN_PROGRESS'
      }
    });
  }

  // 4. Finalizare examen și salvare scor
  async submitExam(token: string, score: number) {
    return this.prisma.examSession.update({
      where: { token },
      data: {
        score,
        status: 'COMPLETED',
        completedAt: new Date()
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
    where: {
      recruiterId: recruiterId,
    },
    include: {
      problems: {
        select: {
          id: true,
          title: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

}