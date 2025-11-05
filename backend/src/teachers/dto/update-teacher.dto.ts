import { PartialType } from '@nestjs/mapped-types';
import { CreateTeacherDto } from './create-teacher.dto';

/**
 * Data Transfer Object for updating teacher entities
 * Extends CreateTeacherDto with optional fields
 */
export class UpdateTeacherDto extends PartialType(CreateTeacherDto) {}
