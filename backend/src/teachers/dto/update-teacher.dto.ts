import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateTeacherDto } from './create-teacher.dto';
import { Instrument } from '@entities/instrument.enum';

export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {
  @ApiPropertyOptional({ example: 'John' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'P@ssword123' })
  password?: string;

  @ApiPropertyOptional({ enum: Instrument, example: Instrument.PIANO })
  instrument?: Instrument;

  @ApiPropertyOptional({ example: 5, minimum: 0, maximum: 80 })
  experience?: number;
}
