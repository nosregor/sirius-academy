import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Teacher } from '@entities/teacher.entity';
import { TeachersService } from './teachers.service';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { Student } from '@entities/student.entity';

describe('TeachersService', () => {
  let service: TeachersService;
  let repository: Repository<Teacher>;

  const repositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    softDelete: jest.fn(),
  } as Partial<Repository<Teacher>>;

  beforeEach(async () => {
    repositoryMock.create = jest.fn();
    repositoryMock.save = jest.fn();
    repositoryMock.find = jest.fn();
    repositoryMock.findOne = jest.fn();
    repositoryMock.merge = jest.fn();
    repositoryMock.softDelete = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TeachersService,
        {
          provide: getRepositoryToken(Teacher),
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<TeachersService>(TeachersService);
    repository = module.get<Repository<Teacher>>(getRepositoryToken(Teacher));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  it('should retrieve all active teachers', async () => {
    const teachers: Teacher[] = [];
    jest.spyOn(repository, 'find').mockResolvedValue(teachers);

    const result = await service.findAllTeachers();

    expect(repository.find).toHaveBeenCalledWith({
      where: { deletedAt: expect.any(Object) },
      order: { lastName: 'ASC', firstName: 'ASC' },
      relations: ['students'],
    });
    expect(result).toBe(teachers);
  });

  it('should retrieve teacher by id', async () => {
    const teacher = new Teacher();
    jest.spyOn(repository, 'findOne').mockResolvedValue(teacher);

    const result = await service.findTeacherById('teacher-id');

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'teacher-id', deletedAt: expect.any(Object) },
      relations: ['students'],
    });
    expect(result).toBe(teacher);
  });

  it('should throw NotFoundException when teacher not found', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(service.findTeacherById('missing-id')).rejects.toThrow(
      'Teacher with id missing-id not found',
    );
  });

  it('should update teacher details and return updated entity', async () => {
    const existingTeacher = new Teacher();
    existingTeacher.id = 'teacher-id';
    existingTeacher.firstName = 'Existing';
    existingTeacher.lastName = 'Teacher';
    existingTeacher.instrument = 'Guitar';
    existingTeacher.experience = 5;

    const updateDto: UpdateTeacherDto = {
      firstName: 'Updated',
      instrument: 'Piano',
      experience: 10,
    };

    const mergedTeacher = { ...existingTeacher, ...updateDto } as Teacher;

    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(existingTeacher);
    jest.spyOn(repository, 'merge').mockReturnValue(mergedTeacher);
    jest.spyOn(repository, 'save').mockResolvedValue(mergedTeacher);
    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(mergedTeacher);

    const result = await service.updateTeacher('teacher-id', updateDto);

    expect(repository.merge).toHaveBeenCalledWith(existingTeacher, updateDto);
    expect(repository.save).toHaveBeenCalledWith(mergedTeacher);
    expect(result.firstName).toBe('Updated');
    expect(result.instrument).toBe('Piano');
    expect(result.experience).toBe(10);
  });

  it('should soft delete teacher by id', async () => {
    const teacher = new Teacher();
    teacher.id = 'teacher-id';

    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(teacher);
    jest.spyOn(repository, 'softDelete').mockResolvedValue({} as any);

    await service.deleteTeacher('teacher-id');

    expect(repository.softDelete).toHaveBeenCalledWith('teacher-id');
  });

  it('should throw BadRequestException when createTeacher fails', async () => {
    const dto = {
      firstName: 'Test',
      lastName: 'Teacher',
      password: 'password123',
      instrument: 'Guitar',
      experience: 5,
    };

    const queryError = new QueryFailedError('', [], new Error());
    jest.spyOn(repository, 'save').mockRejectedValueOnce(queryError);

    expect(service.createTeacher(dto as any)).rejects.toThrow(
      'Failed to create teacher',
    );
  });

  it('should throw BadRequestException when updateTeacher fails to persist', async () => {
    const teacher = new Teacher();
    teacher.id = 'teacher-id';

    const updateDto: UpdateTeacherDto = {
      instrument: 'Violin',
    };

    const queryError = new QueryFailedError('', [], new Error());

    jest.spyOn(repository, 'findOne').mockResolvedValueOnce(teacher);
    jest
      .spyOn(repository, 'merge')
      .mockReturnValue({ ...teacher, ...updateDto } as Teacher);
    jest.spyOn(repository, 'save').mockRejectedValueOnce(queryError);

    try {
      await service.updateTeacher('teacher-id', updateDto);
      // If no error is thrown, fail the test
      fail('Expected updateTeacher to throw BadRequestException');
    } catch (error: unknown) {
      expect((error as Error).message).toBe('Failed to update teacher');
    }
  });

  it('should retrieve students for a teacher', async () => {
    const student = new Student();
    student.id = 'student-id';
    student.firstName = 'Student';
    student.lastName = 'Example';
    const teacher = new Teacher();
    teacher.id = 'teacher-id';
    teacher.students = [student];

    jest.spyOn(repository, 'findOne').mockResolvedValue(teacher);

    const result = await service.findStudentsByTeacher('teacher-id');

    expect(repository.findOne).toHaveBeenCalledWith({
      where: { id: 'teacher-id', deletedAt: expect.any(Object) },
      relations: ['students'],
    });
    expect(result).toEqual([student]);
  });

  it('should throw NotFoundException when retrieving students for a missing teacher', async () => {
    jest.spyOn(repository, 'findOne').mockResolvedValue(null);

    await expect(service.findStudentsByTeacher('missing-id')).rejects.toThrow(
      'Teacher with id missing-id not found',
    );
  });
});
