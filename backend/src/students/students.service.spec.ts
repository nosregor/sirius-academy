import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, QueryFailedError, IsNull } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StudentsService } from './students.service';
import { Student } from '@entities/student.entity';
import { Teacher } from '@entities/teacher.entity';
import { UserRole } from '@entities/user.entity';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { Instrument } from '@/entities';

describe('StudentsService', () => {
  let service: StudentsService;
  let studentsRepository: Repository<Student>;
  let teachersRepository: Repository<Teacher>;

  const repositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useValue: repositoryMock,
        },
        {
          provide: getRepositoryToken(Teacher),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    studentsRepository = module.get<Repository<Student>>(
      getRepositoryToken(Student),
    );
    teachersRepository = module.get<Repository<Teacher>>(
      getRepositoryToken(Teacher),
    );

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllStudents', () => {
    it('should retrieve all active students', async () => {
      const mockStudents = [
        { id: '1', firstName: 'Jane', lastName: 'Doe', role: UserRole.STUDENT },
        {
          id: '2',
          firstName: 'John',
          lastName: 'Smith',
          role: UserRole.STUDENT,
        },
      ] as Partial<Student>[] as Student[];

      jest.spyOn(studentsRepository, 'find').mockResolvedValue(mockStudents);

      const result = await service.findAllStudents();

      expect(result).toEqual(mockStudents);
      expect(studentsRepository.find).toHaveBeenCalledWith({
        where: { deletedAt: IsNull() },
        order: { lastName: 'ASC', firstName: 'ASC' },
        relations: ['teachers'],
      });
    });
  });

  describe('findStudentById', () => {
    it('should retrieve student by id', async () => {
      const mockStudent = {
        id: 'student-id',
        firstName: 'Jane',
        lastName: 'Doe',
        role: UserRole.STUDENT,
        teachers: [],
      } as Partial<Student> as Student;

      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(mockStudent);

      const result = await service.findStudentById('student-id');

      expect(result).toEqual(mockStudent);
      expect(studentsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'student-id', deletedAt: IsNull() },
        relations: ['teachers'],
      });
    });

    it('should throw NotFoundException when student not found', async () => {
      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findStudentById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateStudent', () => {
    it('should update student details and return updated entity', async () => {
      const student = new Student();
      student.id = 'student-id';
      student.firstName = 'Jane';

      const updateDto: UpdateStudentDto = {
        instrument: Instrument.PIANO,
      };

      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(student);
      jest.spyOn(studentsRepository, 'merge').mockReturnValue({
        ...student,
        ...updateDto,
      } as Partial<Student> as Student);
      jest.spyOn(studentsRepository, 'save').mockResolvedValue({
        ...student,
        ...updateDto,
      } as Partial<Student> as Student);

      const result = await service.updateStudent('student-id', updateDto);

      expect(result).toBeDefined();
      expect(studentsRepository.findOne).toHaveBeenCalled();
    });

    it('should throw BadRequestException when updateStudent fails to persist', async () => {
      const student = new Student();
      student.id = 'student-id';

      const updateDto: UpdateStudentDto = {
        instrument: Instrument.PIANO,
      };

      const queryError = new QueryFailedError('', [], new Error());
      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(student);
      jest.spyOn(studentsRepository, 'merge').mockReturnValue({
        ...student,
        ...updateDto,
      } as Partial<Student> as Student);
      jest.spyOn(studentsRepository, 'save').mockRejectedValueOnce(queryError);

      try {
        await service.updateStudent('student-id', updateDto);
        fail('Expected updateStudent to throw BadRequestException');
      } catch (error: unknown) {
        expect((error as Error).message).toBe('Failed to update student');
      }
    });
  });

  describe('deleteStudent', () => {
    it('should soft delete student by id', async () => {
      const student = new Student();
      student.id = 'student-id';

      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(student);
      jest.spyOn(studentsRepository, 'softDelete').mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      await service.deleteStudent('student-id');

      expect(studentsRepository.softDelete).toHaveBeenCalledWith('student-id');
    });
  });

  describe('createStudent', () => {
    it('should throw BadRequestException when createStudent fails', async () => {
      const dto: CreateStudentDto = {
        firstName: 'Jane',
        lastName: 'Doe',
        password: 'password123',
        instrument: Instrument.PIANO,
      };

      const queryError = new QueryFailedError('', [], new Error());
      jest.spyOn(studentsRepository, 'save').mockRejectedValueOnce(queryError);

      expect(service.createStudent(dto as any)).rejects.toThrow(
        'Failed to create student',
      );
    });
  });

  describe('assignTeacherToStudent', () => {
    it('should assign teacher to student', async () => {
      const student = new Student();
      student.id = 'student-id';
      student.teachers = [];

      const teacher = new Teacher();
      teacher.id = 'teacher-id';

      jest
        .spyOn(studentsRepository, 'findOne')
        .mockResolvedValueOnce(student)
        .mockResolvedValueOnce({
          ...student,
          teachers: [teacher],
        } as Partial<Student> as Student);
      jest.spyOn(teachersRepository, 'findOne').mockResolvedValue(teacher);
      jest.spyOn(studentsRepository, 'save').mockResolvedValue({
        ...student,
        teachers: [teacher],
      } as Partial<Student> as Student);

      const result = await service.assignTeacherToStudent(
        'student-id',
        'teacher-id',
      );

      expect(result).toBeDefined();
      expect(studentsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when teacher not found', async () => {
      const student = new Student();
      student.id = 'student-id';
      student.teachers = [];

      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(student);
      jest.spyOn(teachersRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.assignTeacherToStudent('student-id', 'invalid-teacher-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when teacher already assigned', async () => {
      const teacher = new Teacher();
      teacher.id = 'teacher-id';

      const student = new Student();
      student.id = 'student-id';
      student.teachers = [teacher];

      jest.spyOn(studentsRepository, 'findOne').mockResolvedValueOnce(student);
      jest.spyOn(teachersRepository, 'findOne').mockResolvedValue(teacher);

      await expect(
        service.assignTeacherToStudent('student-id', 'teacher-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('unassignTeacherFromStudent', () => {
    it('should unassign teacher from student', async () => {
      const teacher = new Teacher();
      teacher.id = 'teacher-id';

      const student = new Student();
      student.id = 'student-id';
      student.teachers = [{ ...teacher }];

      jest
        .spyOn(studentsRepository, 'findOne')
        .mockResolvedValueOnce(student)
        .mockResolvedValueOnce({
          ...student,
          teachers: [],
        } as Partial<Student> as Student);
      jest.spyOn(teachersRepository, 'findOne').mockResolvedValue(teacher);
      jest.spyOn(studentsRepository, 'save').mockResolvedValue({
        ...student,
        teachers: [],
      } as Partial<Student> as Student);

      const result = await service.unassignTeacherFromStudent(
        'student-id',
        'teacher-id',
      );

      expect(result).toBeDefined();
      expect(studentsRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when teacher not found', async () => {
      const student = new Student();
      student.id = 'student-id';
      student.teachers = [];

      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(student);
      jest.spyOn(teachersRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.unassignTeacherFromStudent('student-id', 'invalid-teacher-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException when teacher not assigned', async () => {
      const teacher = new Teacher();
      teacher.id = 'teacher-id';

      const student = new Student();
      student.id = 'student-id';
      student.teachers = [];

      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(student);
      jest.spyOn(teachersRepository, 'findOne').mockResolvedValue(teacher);

      await expect(
        service.unassignTeacherFromStudent('student-id', 'teacher-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('findTeachersByStudent', () => {
    it('should retrieve teachers for a student', async () => {
      const teacher1 = new Teacher();
      teacher1.id = 'teacher-1';

      const teacher2 = new Teacher();
      teacher2.id = 'teacher-2';

      const student = new Student();
      student.id = 'student-id';
      student.teachers = [teacher1, teacher2];

      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(student);

      const result = await service.findTeachersByStudent('student-id');

      expect(result).toEqual([teacher1, teacher2]);
      expect(result).toHaveLength(2);
    });

    it('should throw NotFoundException when retrieving teachers for a missing student', async () => {
      jest.spyOn(studentsRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findTeachersByStudent('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
