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
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
} from '@nestjs/swagger';

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
  @ApiOperation({
    summary: 'Create teacher',
    description: 'Create a new teacher with instrument and experience.',
  })
  @ApiCreatedResponse({ description: 'Teacher created.', type: Teacher })
  createTeacher(@Body() createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    return this.teachersService.createTeacher(createTeacherDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List teachers',
    description: 'Retrieve all teachers.',
  })
  @ApiOkResponse({
    description: 'List of teachers returned.',
    type: Teacher,
    isArray: true,
  })
  findAllTeachers(): Promise<Teacher[]> {
    return this.teachersService.findAllTeachers();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get teacher by ID',
    description: 'Retrieve a single teacher by UUID.',
  })
  @ApiParam({ name: 'id', description: 'Teacher UUID', format: 'uuid' })
  @ApiOkResponse({ description: 'Teacher found.', type: Teacher })
  findTeacherById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Teacher> {
    return this.teachersService.findTeacherById(id);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update teacher',
    description: 'Update an existing teacher by UUID.',
  })
  @ApiParam({ name: 'id', description: 'Teacher UUID', format: 'uuid' })
  @ApiOkResponse({ description: 'Teacher updated.', type: Teacher })
  updateTeacher(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    return this.teachersService.updateTeacher(id, updateTeacherDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete teacher',
    description: 'Soft delete a teacher by UUID.',
  })
  @ApiParam({ name: 'id', description: 'Teacher UUID', format: 'uuid' })
  @ApiNoContentResponse({ description: 'Teacher deleted.' })
  deleteTeacher(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.teachersService.deleteTeacher(id);
  }

  @Get(':id/students')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: "List teacher's students",
    description: 'Retrieve all students assigned to a teacher.',
  })
  @ApiParam({ name: 'id', description: 'Teacher UUID', format: 'uuid' })
  @ApiOkResponse({
    description: "Teacher's students returned.",
    type: Student,
    isArray: true,
  })
  findStudentsByTeacher(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Student[]> {
    return this.teachersService.findStudentsByTeacher(id);
  }
}
