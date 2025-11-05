import { PartialType } from '@nestjs/mapped-types';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';
import { Instrument } from '@entities/instrument.enum';

export class UpdateStudentDto extends PartialType(CreateStudentDto) {
  @ApiPropertyOptional({ example: 'Jane' })
  firstName?: string;

  @ApiPropertyOptional({ example: 'Smith' })
  lastName?: string;

  @ApiPropertyOptional({ example: 'P@ssword123' })
  password?: string;

  @ApiPropertyOptional({ enum: Instrument, example: Instrument.GUITAR })
  instrument?: Instrument;
}
