import { IsEnum, IsNotEmpty } from 'class-validator';
import { LessonStatus } from '@entities/lesson.entity';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object for updating lesson status
 *
 * Used for status transitions:
 * - pending → confirmed (teacher confirms student request)
 * - pending → cancelled (teacher rejects)
 * - confirmed → completed (lesson finished)
 * - any → cancelled (lesson cancelled)
 */
export class UpdateLessonStatusDto {
  @ApiProperty({ enum: ['pending', 'confirmed', 'cancelled', 'completed'] })
  @IsNotEmpty({ message: 'Status is required' })
  @IsEnum(LessonStatus, {
    message: 'Status must be one of: pending, confirmed, cancelled, completed',
  })
  status!: LessonStatus;
}
