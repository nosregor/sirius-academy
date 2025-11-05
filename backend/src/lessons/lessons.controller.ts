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
  Query,
} from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonStatusDto } from './dto/update-lesson-status.dto';
import { Lesson, LessonStatus } from '@entities/lesson.entity';

/**
 * LessonsController
 *
 * Handles HTTP requests for lesson-related operations
 * Implements RESTful API endpoints with explicit status codes
 */
@Controller('lessons')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  /**
   * Create a new lesson
   * POST /lessons
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  createLesson(@Body() createLessonDto: CreateLessonDto): Promise<Lesson> {
    return this.lessonsService.createLesson(createLessonDto);
  }

  /**
   * Get all lessons with optional filtering
   * GET /lessons?status=pending&teacherId=uuid&studentId=uuid
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  findAllLessons(
    @Query('status') status?: LessonStatus,
    @Query('teacherId') teacherId?: string,
    @Query('studentId') studentId?: string,
  ): Promise<Lesson[]> {
    return this.lessonsService.findAllLessons(status, teacherId, studentId);
  }

  /**
   * Get all lessons for a specific teacher
   * GET /lessons/teacher/:teacherId
   * NOTE: Must come BEFORE /:id route to avoid matching conflicts
   */
  @Get('teacher/:teacherId')
  @HttpCode(HttpStatus.OK)
  findLessonsByTeacher(
    @Param('teacherId', new ParseUUIDPipe()) teacherId: string,
  ): Promise<Lesson[]> {
    return this.lessonsService.findLessonsByTeacher(teacherId);
  }

  /**
   * Get all lessons for a specific student
   * GET /lessons/student/:studentId
   * NOTE: Must come BEFORE /:id route to avoid matching conflicts
   */
  @Get('student/:studentId')
  @HttpCode(HttpStatus.OK)
  findLessonsByStudent(
    @Param('studentId', new ParseUUIDPipe()) studentId: string,
  ): Promise<Lesson[]> {
    return this.lessonsService.findLessonsByStudent(studentId);
  }

  /**
   * Get a single lesson by ID
   * GET /lessons/:id
   * NOTE: Must come AFTER literal routes (teacher, student) to avoid conflicts
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findLessonById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Lesson> {
    return this.lessonsService.findLessonById(id);
  }

  /**
   * Confirm a pending lesson (teacher action)
   * PUT /lessons/:id/confirm
   */
  @Put(':id/confirm')
  @HttpCode(HttpStatus.OK)
  confirmLesson(@Param('id', new ParseUUIDPipe()) id: string): Promise<Lesson> {
    return this.lessonsService.confirmLesson(id);
  }

  /**
   * Reject a pending lesson (teacher action)
   * PUT /lessons/:id/reject
   */
  @Put(':id/reject')
  @HttpCode(HttpStatus.OK)
  rejectLesson(@Param('id', new ParseUUIDPipe()) id: string): Promise<Lesson> {
    return this.lessonsService.rejectLesson(id);
  }

  /**
   * Complete a confirmed lesson
   * PUT /lessons/:id/complete
   */
  @Put(':id/complete')
  @HttpCode(HttpStatus.OK)
  completeLesson(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Lesson> {
    return this.lessonsService.completeLesson(id);
  }

  /**
   * Cancel a lesson
   * PUT /lessons/:id/cancel
   */
  @Put(':id/cancel')
  @HttpCode(HttpStatus.OK)
  cancelLesson(@Param('id', new ParseUUIDPipe()) id: string): Promise<Lesson> {
    return this.lessonsService.cancelLesson(id);
  }

  /**
   * Update lesson status
   * PUT /lessons/:id/status
   */
  @Put(':id/status')
  @HttpCode(HttpStatus.OK)
  updateLessonStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateLessonStatusDto: UpdateLessonStatusDto,
  ): Promise<Lesson> {
    return this.lessonsService.updateLessonStatus(id, updateLessonStatusDto);
  }

  /**
   * Delete a lesson
   * DELETE /lessons/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteLesson(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.lessonsService.deleteLesson(id);
  }
}
