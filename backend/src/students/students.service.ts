import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, QueryFailedError } from 'typeorm';
import { Student } from '@entities/student.entity';
import { Teacher } from '@entities/teacher.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { UserRole } from '@entities/user.entity';

/**
 * StudentsService
 *
 * Handles business logic for student operations
 * Includes CRUD operations and teacher assignment management
 */
@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,
  ) {}

  /**
   * Create a new student with validated data
   * Ensures role is set to student and password is hashed via entity hooks
   */
  async createStudent(createStudentDto: CreateStudentDto): Promise<Student> {
    const student = this.studentsRepository.create({
      ...createStudentDto,
      role: UserRole.STUDENT,
      isPasswordHashed: false,
    });

    try {
      return await this.studentsRepository.save(student);
    } catch (error) {
      this.handleDatabaseError(error, 'Failed to create student');
    }
  }

  /**
   * Retrieve all active students (excluding soft-deleted records)
   */
  async findAllStudents(): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { deletedAt: IsNull() },
      order: { lastName: 'ASC', firstName: 'ASC' },
      relations: ['teachers'],
    });
  }

  /**
   * Retrieve a single student by ID with related teachers
   * Throws NotFoundException if student is not found or soft-deleted
   */
  async findStudentById(id: string): Promise<Student> {
    const student = await this.studentsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['teachers'],
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    return student;
  }

  /**
   * Update student details with validated data
   * Returns updated student with related teachers
   */
  async updateStudent(
    id: string,
    updateStudentDto: UpdateStudentDto,
  ): Promise<Student> {
    const student = await this.findStudentById(id);

    const updatedStudent = this.studentsRepository.merge(
      student,
      updateStudentDto,
    );
    try {
      await this.studentsRepository.save(updatedStudent);

      // Fetch updated entity with relations in a single query
      const result = await this.studentsRepository.findOne({
        where: { id, deletedAt: IsNull() },
        relations: ['teachers'],
      });

      if (!result) {
        throw new NotFoundException(`Student with id ${id} not found`);
      }

      return result;
    } catch (error) {
      this.handleDatabaseError(error, 'Failed to update student');
    }
  }

  /**
   * Soft delete a student by setting deletedAt timestamp
   * Returns void but ensures student exists before deletion
   */
  async deleteStudent(id: string): Promise<void> {
    await this.findStudentById(id);
    await this.studentsRepository.softDelete(id);
  }

  /**
   * Assign a teacher to a student (add to many-to-many relationship)
   * Validates both entities exist before assignment
   */
  async assignTeacherToStudent(
    studentId: string,
    teacherId: string,
  ): Promise<Student> {
    const student = await this.findStudentById(studentId);

    const teacher = await this.teachersRepository.findOne({
      where: { id: teacherId, deletedAt: IsNull() },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${teacherId} not found`);
    }

    if (!student.teachers) {
      student.teachers = [];
    }

    const isAlreadyAssigned = student.teachers.some((t) => t.id === teacherId);
    if (isAlreadyAssigned) {
      throw new BadRequestException(
        'Teacher is already assigned to this student',
      );
    }

    student.teachers.push(teacher);
    await this.studentsRepository.save(student);

    return this.findStudentById(studentId);
  }

  /**
   * Unassign a teacher from a student (remove from many-to-many relationship)
   * Validates both entities exist before removal
   */
  async unassignTeacherFromStudent(
    studentId: string,
    teacherId: string,
  ): Promise<Student> {
    const student = await this.findStudentById(studentId);

    const teacher = await this.teachersRepository.findOne({
      where: { id: teacherId, deletedAt: IsNull() },
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${teacherId} not found`);
    }

    if (!student.teachers || student.teachers.length === 0) {
      throw new BadRequestException('Student has no assigned teachers');
    }

    const teacherIndex = student.teachers.findIndex((t) => t.id === teacherId);
    if (teacherIndex === -1) {
      throw new BadRequestException('Teacher is not assigned to this student');
    }

    student.teachers.splice(teacherIndex, 1);
    await this.studentsRepository.save(student);

    return this.findStudentById(studentId);
  }

  /**
   * Retrieve all teachers for a given student
   * Throws NotFoundException if student does not exist
   */
  async findTeachersByStudent(id: string): Promise<Teacher[]> {
    const student = await this.studentsRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['teachers'],
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${id} not found`);
    }

    return student.teachers;
  }

  private handleDatabaseError(error: unknown, message: string): never {
    if (error instanceof QueryFailedError) {
      throw new BadRequestException(message);
    }
    throw error;
  }
}
