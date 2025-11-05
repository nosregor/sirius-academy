import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lesson } from '@entities/lesson.entity';
import { Teacher } from '@entities/teacher.entity';
import { Student } from '@entities/student.entity';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';

/**
 * LessonsModule
 *
 * Manages lesson-related operations including CRUD operations,
 * status transitions, and overlap detection
 */
@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Teacher, Student])],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [],
})
export class LessonsModule {}
