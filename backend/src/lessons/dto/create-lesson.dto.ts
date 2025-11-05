import { IsEnum, IsNotEmpty, IsUUID, IsDate } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '@entities/user.entity';
import {
  IsValidTimeSlot,
  IsValidLessonDuration,
  IsAfterStartTime,
} from '@common/validators/time-slot.validator';

/**
 * Data Transfer Object for creating a new lesson
 *
 * Validates all required fields according to business rules:
 * - Time slots must be on 15-minute increments
 * - Duration must be between 15 minutes and 4 hours
 * - End time must be after start time
 */
export class CreateLessonDto {
  /**
   * UUID of the teacher for this lesson
   */
  @IsNotEmpty({ message: 'Teacher ID is required' })
  @IsUUID('4', { message: 'Teacher ID must be a valid UUID' })
  teacherId!: string;

  /**
   * UUID of the student for this lesson
   */
  @IsNotEmpty({ message: 'Student ID is required' })
  @IsUUID('4', { message: 'Student ID must be a valid UUID' })
  studentId!: string;

  /**
   * Lesson start time
   * Must be on 15-minute increment (e.g., 9:00, 9:15, 9:30, 9:45)
   */
  @IsNotEmpty({ message: 'Start time is required' })
  @Type(() => Date)
  @IsDate({ message: 'Start time must be a valid date' })
  @IsValidTimeSlot()
  startTime!: Date;

  /**
   * Lesson end time
   * Must be after start time
   * Duration between start and end must be 15 min - 4 hours
   */
  @IsNotEmpty({ message: 'End time is required' })
  @Type(() => Date)
  @IsDate({ message: 'End time must be a valid date' })
  @IsAfterStartTime()
  @IsValidLessonDuration()
  endTime!: Date;

  /**
   * Role of the user creating the lesson (teacher or student)
   * Determines initial lesson status:
   * - Teacher-created lessons → confirmed
   * - Student-created lessons → pending
   */
  @IsNotEmpty({ message: 'Creator role is required' })
  @IsEnum(UserRole, {
    message: 'Creator role must be either "teacher" or "student"',
  })
  creatorRole!: UserRole;
}
