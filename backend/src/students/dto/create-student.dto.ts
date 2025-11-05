import {
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from '@common/constants/validation.constants';

/**
 * Data Transfer Object for creating a new student
 *
 * Validates all required fields according to business rules defined
 * in shared validation constants.
 */
export class CreateStudentDto {
  /**
   * Student's first name
   * Must be 2-100 characters, letters, spaces, hyphens, and apostrophes only
   */
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.FIRST_NAME_REQUIRED })
  @MinLength(VALIDATION_RULES.NAME_MIN_LENGTH)
  @MaxLength(VALIDATION_RULES.NAME_MAX_LENGTH)
  @Matches(VALIDATION_RULES.NAME_REGEX, {
    message: VALIDATION_MESSAGES.NAME_FORMAT,
  })
  firstName!: string;

  /**
   * Student's last name
   * Must be 2-100 characters, letters, spaces, hyphens, and apostrophes only
   */
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.LAST_NAME_REQUIRED })
  @MinLength(VALIDATION_RULES.NAME_MIN_LENGTH)
  @MaxLength(VALIDATION_RULES.NAME_MAX_LENGTH)
  @Matches(VALIDATION_RULES.NAME_REGEX, {
    message: VALIDATION_MESSAGES.NAME_FORMAT,
  })
  lastName!: string;

  /**
   * Student's password
   * Will be hashed before storage using bcrypt
   * Must be 8-64 characters with at least one uppercase, lowercase, and digit
   */
  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.PASSWORD_REQUIRED })
  @MinLength(VALIDATION_RULES.PASSWORD_MIN_LENGTH)
  @MaxLength(VALIDATION_RULES.PASSWORD_MAX_LENGTH)
  @Matches(VALIDATION_RULES.PASSWORD_STRENGTH_REGEX, {
    message: VALIDATION_MESSAGES.PASSWORD_STRENGTH,
  })
  password!: string;

  /**
   * Primary instrument the student wants to learn
   * e.g., "Piano", "Guitar", "Violin", "Voice"
   */
  @Transform(({ value }) => value?.trim())
  @IsString()
  @IsNotEmpty({ message: VALIDATION_MESSAGES.INSTRUMENT_REQUIRED })
  @MinLength(VALIDATION_RULES.INSTRUMENT_MIN_LENGTH)
  @MaxLength(VALIDATION_RULES.INSTRUMENT_MAX_LENGTH)
  instrument!: string;
}
