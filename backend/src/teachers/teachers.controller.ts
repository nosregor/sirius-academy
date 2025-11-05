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
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Teacher } from '@entities/teacher.entity';
import { Student } from '@entities/student.entity';
import { ApiTags } from '@nestjs/swagger';

/**
 * TeachersController
 *
 * Handles HTTP requests for teacher-related operations
 * Implements RESTful API endpoints with explicit status codes
 */
@ApiTags('Teachers')
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createTeacher(@Body() createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    return this.teachersService.createTeacher(createTeacherDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAllTeachers(): Promise<Teacher[]> {
    return this.teachersService.findAllTeachers();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findTeacherById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Teacher> {
    return this.teachersService.findTeacherById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updateTeacher(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    return this.teachersService.updateTeacher(id, updateTeacherDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteTeacher(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.teachersService.deleteTeacher(id);
  }

  @Get(':id/students')
  @HttpCode(HttpStatus.OK)
  findStudentsByTeacher(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Student[]> {
    return this.teachersService.findStudentsByTeacher(id);
  }
}
