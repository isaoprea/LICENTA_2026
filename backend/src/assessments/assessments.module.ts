import { Module } from '@nestjs/common';
import { AssessmentsController } from './assessments.controller';
import { AssessmentsService } from './assessments.service';
import { PrismaService } from '../prisma.service';
import {EmailService} from '../email/email.service';

@Module({
  controllers: [AssessmentsController],
  providers: [AssessmentsService, PrismaService, EmailService],
})
export class AssessmentsModule {}