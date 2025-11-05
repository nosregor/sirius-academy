import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Student } from '@entities/student.entity';
import { Teacher } from '@entities/teacher.entity';

/**
 * StudentsController
 *
 * Handles HTTP requests for student-related operations
 * Implements RESTful API endpoints with explicit status codes
 */
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createStudent(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentsService.createStudent(createStudentDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAllStudents(): Promise<Student[]> {
    return this.studentsService.findAllStudents();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findStudentById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Student> {
    return this.studentsService.findStudentById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateStudent(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentsService.updateStudent(id, updateStudentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteStudent(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.studentsService.deleteStudent(id);
  }

  @Get(':id/teachers')
  @HttpCode(HttpStatus.OK)
  findTeachersByStudent(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Teacher[]> {
    return this.studentsService.findTeachersByStudent(id);
  }

  @Post(':id/teachers/:teacherId')
  @HttpCode(HttpStatus.OK)
  assignTeacherToStudent(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('teacherId', new ParseUUIDPipe()) teacherId: string,
  ): Promise<Student> {
    return this.studentsService.assignTeacherToStudent(id, teacherId);
  }

  @Delete(':id/teachers/:teacherId')
  @HttpCode(HttpStatus.OK)
  unassignTeacherFromStudent(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('teacherId', new ParseUUIDPipe()) teacherId: string,
  ): Promise<Student> {
    return this.studentsService.unassignTeacherFromStudent(id, teacherId);
  }
}
