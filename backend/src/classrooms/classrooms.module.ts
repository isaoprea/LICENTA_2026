import { Module } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { ClassroomsController } from './classrooms.controller';
import { AssignmentsController } from './assignments.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [NotificationsModule,PrismaModule],
  controllers: [ClassroomsController, AssignmentsController],
  providers: [ClassroomsService, PrismaService],
})
export class ClassroomsModule {}