import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { SubmissionsController } from './submissions/submissions.controller';
import { SubmissionsService } from './submissions/submissions.service';

@Module({
  imports: [],
  controllers: [AppController, SubmissionsController],
  providers: [AppService, PrismaService, SubmissionsService],
})
export class AppModule {}