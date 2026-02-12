import { Controller, Get, Param } from '@nestjs/common';
import { LessonsService } from './lessons.service';

@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get()
  async getAll() {
    return this.lessonsService.findAll();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.lessonsService.findOne(id);
  }
}