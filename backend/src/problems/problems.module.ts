import { Module } from '@nestjs/common';
import { ProblemsService } from './problems.service';
import { ProblemsController } from './problems.controller';
import { PrismaService } from '../prisma.service'; 
@Module({
  controllers: [ProblemsController],
  providers: [ProblemsService, PrismaService],
  exports: [ProblemsService]
})
export class ProblemsModule {}