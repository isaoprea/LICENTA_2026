import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { JoinClassroomDto } from './dto/join-classroom.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { NotificationsService } from '../notifications/notifications.service'; // Importul nou

@Injectable()
export class ClassroomsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService // Injectarea serviciului
  ) {}

  async create(createClassroomDto: CreateClassroomDto) {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    return this.prisma.classroom.create({
      data: {
        name: createClassroomDto.name,
        description: createClassroomDto.description,
        inviteCode: inviteCode,
        teacherId: createClassroomDto.teacherId,
      },
    });
  }

  async joinClassroom(joinDto: JoinClassroomDto) {
    const classroom = await this.prisma.classroom.findUnique({
      where: { inviteCode: joinDto.inviteCode },
      include: { students: true }
    });

    if (!classroom) {
      throw new NotFoundException('Codul de invitație este invalid.');
    }

    const isAlreadyMember = classroom.students.some(s => s.id === joinDto.userId);
    if (isAlreadyMember) {
      throw new ConflictException('Ești deja membru al acestei clase.');
    }

    return this.prisma.classroom.update({
      where: { inviteCode: joinDto.inviteCode },
      data: {
        students: {
          connect: { id: joinDto.userId }
        }
      }
    });
  }

  async getTeacherClasses(teacherId: string) {
    return this.prisma.classroom.findMany({
      where: { teacherId },
      include: {
        students: {
          select: { id: true, name: true, email: true }
        },
        assignments: {
          include: { 
            problem: true,
            student: { select: { name: true, email: true } } 
          }
        }
      }
    });
  }

  async createAssignments(dto: CreateAssignmentDto) {
    const assignments = await Promise.all(
      dto.studentIds.map(async (studentId) => {
        const assignment = await this.prisma.assignment.create({
          data: {
            title: dto.title,
            problemId: dto.problemId,
            studentId: studentId,
            language: dto.language,
            classroomId: dto.classroomId,
            status: 'PENDING'
          }
        });

        await this.notificationsService.createNotification(
          studentId,
          `Ai primit o temă nouă: ${dto.title}`,
          'NEW_ASSIGNMENT'
        );

        return assignment;
      })
    );
    return assignments;
  }

  async setGrade(assignmentId: string, grade: number) {
    const assignment = await this.prisma.assignment.update({
      where: { id: assignmentId },
      data: { grade },
      include: { student: true }
    });

    await this.notificationsService.createNotification(
      assignment.studentId,
      `Ai primit nota ${grade} la tema: ${assignment.title}`,
      'GRADE_GIVEN'
    );

    return assignment;
  }

  async getStudentAssignments(userId: string) {
    return this.prisma.assignment.findMany({
      where: { studentId: userId },
      include: {
        problem: {
          select: { title: true, difficulty: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getClassroomStats(classroomId: string) {
    return this.prisma.classroom.findUnique({
      where: { id: classroomId },
      include: {
        students: {
          include: {
            submissions: {
              where: { status: 'SUCCESS' },
              include: { problem: true }
            },
            assignments: true
          }
        },
        assignments: {
            include: { problem: true, student: true }
        }
      }
    });


  }

  async getStudentClassrooms(userId: string) {
  return this.prisma.classroom.findMany({
    where: {
      students: { some: { id: userId } } 
    },
    include: {
      teacher: { select: { name: true, email: true } },
      _count: { select: { assignments: true } }
    }
  });
}

  async getStudentClassroomDetails(classroomId: string, userId: string) {
    const classroom = await this.prisma.classroom.findFirst({
      where: {
        id: classroomId,
        students: { some: { id: userId } }
      },
      include: {
        teacher: { select: { id: true, name: true, email: true } },
        students: { select: { id: true, name: true, email: true } },
        assignments: {
          where: { studentId: userId },
          include: {
            problem: { select: { title: true, difficulty: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        _count: { select: { students: true, assignments: true } }
      }
    });

    if (!classroom) {
      throw new NotFoundException('Clasa nu a fost găsită sau nu ai acces la ea.');
    }

    return classroom;
  }

  async getAssignmentByIdForUser(assignmentId: string, userId: string, role: string) {
    const assignment = await this.prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        problem: true,
        classroom: { select: { name: true } }
      }
    });

    if (!assignment) {
      throw new NotFoundException('Tema nu a fost găsită.');
    }

    if (assignment.studentId !== userId && role !== 'TEACHER' && role !== 'ADMIN') {
      throw new ForbiddenException('Nu ai permisiunea de a accesa această temă.');
    }

    return assignment;
  }
}