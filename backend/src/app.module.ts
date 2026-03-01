import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { SubmissionsController } from './submissions/submissions.controller';
import { SubmissionsService } from './submissions/submissions.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { JwtStrategy } from './auth/jwt.strategy';
import { AdminController } from './admin.controller'; 
import { AdminGuard } from './auth/admin.guard';
import { LessonsModule } from './lessons/lessons.module';
import { UsersModule } from './users/users.module';
import { AiService } from './ai/ai.service';
import { ClassroomsModule } from './classrooms/classrooms.module';
import {PrismaModule} from './prisma/prisma.module';
import { NotificationsModule } from './notifications/notifications.module';
@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      signOptions: { expiresIn: '7d' },

    }),
    LessonsModule,
    UsersModule,
    ClassroomsModule,
    PrismaModule,
    NotificationsModule,
  ],
  controllers: [AppController, SubmissionsController, AuthController, AdminController],
  providers: [AppService, PrismaService, SubmissionsService, AuthService, JwtStrategy, AdminGuard, AiService],
})
export class AppModule {}