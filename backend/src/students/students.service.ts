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

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,
  ) {}

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

  async findAllStudents(): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { deletedAt: IsNull() },
      order: { lastName: 'ASC', firstName: 'ASC' },
      relations: ['teachers'],
    });
  }

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

  async deleteStudent(id: string): Promise<void> {
    await this.findStudentById(id);
    await this.studentsRepository.softDelete(id);
  }

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
