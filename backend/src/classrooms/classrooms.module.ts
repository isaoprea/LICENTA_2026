import { Module } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { ClassroomsController } from './classrooms.controller';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [NotificationsModule,PrismaModule],
  controllers: [ClassroomsController],
  providers: [ClassroomsService, PrismaService],
})
export class ClassroomsModule {}