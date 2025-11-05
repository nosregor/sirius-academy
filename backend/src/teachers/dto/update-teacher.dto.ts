import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';

/**
 * Data Transfer Object for updating teacher entities
 * Extends CreateTeacherDto with optional fields
 */
export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'P@ssword123' })
  password?: string;

  @ApiPropertyOptional({ example: 'Piano' })
  instrument?: string;

  @ApiPropertyOptional({ example: 5, minimum: 0, maximum: 80 })
  experience?: number;
}
