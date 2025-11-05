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
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';

/**
 * StudentsController
 *
 * Handles HTTP requests for student-related operations
 * Implements RESTful API endpoints with explicit status codes
 */
@ApiTags('Students')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create student',
    description: 'Create a new student with instrument.',
  })
  @ApiResponse({ status: 201, description: 'Student created.' })
  createStudent(@Body() createStudentDto: CreateStudentDto): Promise<Student> {
    return this.studentsService.createStudent(createStudentDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List students',
    description: 'Retrieve all students.',
  })
  @ApiResponse({ status: 200, description: 'List of students returned.' })
  findAllStudents(): Promise<Student[]> {
    return this.studentsService.findAllStudents();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get student by ID',
    description: 'Retrieve a single student by UUID.',
  })
  @ApiParam({ name: 'id', description: 'Student UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Student found.' })
  findStudentById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Student> {
    return this.studentsService.findStudentById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update student',
    description: 'Update an existing student by UUID.',
  })
  @ApiParam({ name: 'id', description: 'Student UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Student updated.' })
  updateStudent(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    return this.studentsService.updateStudent(id, updateStudentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete student',
    description: 'Soft delete a student by UUID.',
  })
  @ApiParam({ name: 'id', description: 'Student UUID', format: 'uuid' })
  @ApiResponse({ status: 204, description: 'Student deleted.' })
  deleteStudent(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.studentsService.deleteStudent(id);
  }

  @Get(':id/teachers')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "List student's teachers",
    description: 'Retrieve all teachers assigned to a student.',
  })
  @ApiParam({ name: 'id', description: 'Student UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: "Student's teachers returned." })
  findTeachersByStudent(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Teacher[]> {
    return this.studentsService.findTeachersByStudent(id);
  }

  @Post(':id/teachers/:teacherId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Assign teacher to student',
    description: 'Assign a teacher to a student by their UUIDs.',
  })
  @ApiParam({ name: 'id', description: 'Student UUID', format: 'uuid' })
  @ApiParam({ name: 'teacherId', description: 'Teacher UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Teacher assigned.' })
  assignTeacherToStudent(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('teacherId', new ParseUUIDPipe()) teacherId: string,
  ): Promise<Student> {
    return this.studentsService.assignTeacherToStudent(id, teacherId);
  }

  @Delete(':id/teachers/:teacherId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Unassign teacher from student',
    description: 'Remove a teacher assignment from a student.',
  })
  @ApiParam({ name: 'id', description: 'Student UUID', format: 'uuid' })
  @ApiParam({ name: 'teacherId', description: 'Teacher UUID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Teacher unassigned.' })
  unassignTeacherFromStudent(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('teacherId', new ParseUUIDPipe()) teacherId: string,
  ): Promise<Student> {
    return this.studentsService.unassignTeacherFromStudent(id, teacherId);
  }
}
