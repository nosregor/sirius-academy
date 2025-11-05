import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository, QueryFailedError } from 'typeorm';
import { Teacher } from '@entities/teacher.entity';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { UserRole } from '@entities/user.entity';
import { Student } from '@entities/student.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,
  ) {}

  async createTeacher(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    const teacher = this.teachersRepository.create({
      ...createTeacherDto,
      role: UserRole.TEACHER,
      isPasswordHashed: false,
    });

    try {
      return await this.teachersRepository.save(teacher);
    } catch (error) {
      this.handleDatabaseError(error, 'Failed to create teacher');
    }
  }

  async findAllTeachers(): Promise<Teacher[]> {
    return this.teachersRepository.find({
      where: { deletedAt: IsNull() },
      order: { lastName: 'ASC', firstName: 'ASC' },
      relations: ['students'],
    });
  }

  async findTeacherById(id: string): Promise<Teacher> {
    const teacher = await this.teachersRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['students'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }

    return teacher;
  }

  async updateTeacher(
    id: string,
    updateTeacherDto: UpdateTeacherDto,
  ): Promise<Teacher> {
    const teacher = await this.findTeacherById(id);

    const updatedTeacher = this.teachersRepository.merge(
      teacher,
      updateTeacherDto,
    );
    try {
      await this.teachersRepository.save(updatedTeacher);

      const result = await this.teachersRepository.findOne({
        where: { id, deletedAt: IsNull() },
        relations: ['students'],
      });

      if (!result) {
        throw new NotFoundException(`Teacher with id ${id} not found`);
      }

      return result;
    } catch (error) {
      this.handleDatabaseError(error, 'Failed to update teacher');
    }
  }

  async deleteTeacher(id: string): Promise<void> {
    await this.findTeacherById(id);
    await this.teachersRepository.softDelete(id);
  }

  async findStudentsByTeacher(id: string): Promise<Student[]> {
    const teacher = await this.teachersRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['students'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${id} not found`);
    }

    return teacher.students;
  }

  private handleDatabaseError(error: unknown, message: string): never {
    if (error instanceof QueryFailedError) {
      throw new BadRequestException(message);
    }
    throw error;
  }
}
