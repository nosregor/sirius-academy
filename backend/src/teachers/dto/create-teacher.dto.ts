import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsString,
  IsEnum,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from '@common/constants/validation.constants';
import { ApiProperty } from '@nestjs/swagger';
import { Instrument } from '@entities/instrument.enum';

/**
 * Data Transfer Object for creating teacher entities
 *
 * Validates all required fields according to business rules defined
 * in shared validation constants.
 */
export class CreateTeacherDto {
  /**
   * Teacher's first name
   * Must be 2-100 characters, letters, spaces, hyphens, and apostrophes only
   */
  @ApiProperty({ example: 'John' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.FIRST_NAME_REQUIRED })
  @MinLength(VALIDATION_RULES.NAME_MIN_LENGTH)
  @MaxLength(VALIDATION_RULES.NAME_MAX_LENGTH)
  @Matches(VALIDATION_RULES.NAME_REGEX, {
    message: VALIDATION_MESSAGES.NAME_FORMAT,
  })
  firstName!: string;

  /**
   * Teacher's last name
   * Must be 2-100 characters, letters, spaces, hyphens, and apostrophes only
   */
  @ApiProperty({ example: 'Doe' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LAST_NAME_REQUIRED })
  @MinLength(VALIDATION_RULES.NAME_MIN_LENGTH)
  @MaxLength(VALIDATION_RULES.NAME_MAX_LENGTH)
  @Matches(VALIDATION_RULES.NAME_REGEX, {
    message: VALIDATION_MESSAGES.NAME_FORMAT,
  })
  lastName!: string;

  /**
   * Teacher's password
   * Will be hashed before storage using bcrypt
   * Must be 8-64 characters with at least one uppercase, lowercase, and digit
   */
  @ApiProperty({ example: 'P@ssword123' })
  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.PASSWORD_REQUIRED })
  @MinLength(VALIDATION_RULES.PASSWORD_MIN_LENGTH)
  @MaxLength(VALIDATION_RULES.PASSWORD_MAX_LENGTH)
  @Matches(VALIDATION_RULES.PASSWORD_STRENGTH_REGEX, {
    message: VALIDATION_MESSAGES.PASSWORD_STRENGTH,
  })
  password!: string;

  /**
   * Primary instrument the teacher teaches
   * Must be one of the valid Instrument enum values
   */
  @ApiProperty({ enum: Instrument, example: Instrument.PIANO })
  @IsNotEmpty({ message: VALIDATION_MESSAGES.INSTRUMENT_REQUIRED })
  @IsEnum(Instrument, {
    message: 'Instrument must be one of the valid instrument types',
  })
  instrument!: Instrument;

  /**
   * Years of teaching experience
   * Must be between 0 and 80 years
   */
  @ApiProperty({ example: 5, minimum: 0, maximum: 80 })
  @IsInt()
  @Min(VALIDATION_RULES.EXPERIENCE_MIN_YEARS)
  @Max(VALIDATION_RULES.EXPERIENCE_MAX_YEARS)
  experience!: number;
}
