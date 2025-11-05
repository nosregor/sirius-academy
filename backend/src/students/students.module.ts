import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '@entities/student.entity';
import { Teacher } from '@entities/teacher.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

/**
 * StudentsModule
 *
 * Manages student-related operations including CRUD operations
 * and teacher assignments.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Student, Teacher])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
