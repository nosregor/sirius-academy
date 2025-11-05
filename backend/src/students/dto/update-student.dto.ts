import { PartialType } from '@nestjs/mapped-types';
import { CreateStudentDto } from './create-student.dto';

/**
 * Data Transfer Object for updating an existing student
 *
 * All fields are optional - extends CreateStudentDto with PartialType
 */
export class UpdateStudentDto extends PartialType(CreateStudentDto) {}
