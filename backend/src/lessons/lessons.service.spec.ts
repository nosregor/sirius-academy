import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LessonsService } from './lessons.service';
import { Lesson, LessonStatus } from '@entities/lesson.entity';
import { Teacher } from '@entities/teacher.entity';
import { Student } from '@entities/student.entity';
import { UserRole } from '@entities/user.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonStatusDto } from './dto/update-lesson-status.dto';

/**
 * Comprehensive unit tests for LessonsService
 * Tests all CRUD operations, overlap detection, and status transitions
 */
describe('LessonsService', () => {
  let service: LessonsService;

  // Mock repositories
  const mockLessonsRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockTeachersRepository = {
    findOne: jest.fn(),
  };

  const mockStudentsRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LessonsService,
        {
          provide: getRepositoryToken(Lesson),
          useValue: mockLessonsRepository,
        },
        {
          provide: getRepositoryToken(Teacher),
          useValue: mockTeachersRepository,
        },
        {
          provide: getRepositoryToken(Student),
          useValue: mockStudentsRepository,
        },
      ],
    }).compile();

    service = module.get<LessonsService>(LessonsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createLesson', () => {
    const createLessonDto: CreateLessonDto = {
      teacherId: 'teacher-uuid',
      studentId: 'student-uuid',
      startTime: new Date('2025-11-10T10:00:00Z'),
      endTime: new Date('2025-11-10T11:00:00Z'),
      creatorRole: UserRole.TEACHER,
    };

    const mockTeacher = {
      id: 'teacher-uuid',
      firstName: 'John',
      lastName: 'Doe',
      students: [{ id: 'student-uuid' }],
    } as Partial<Teacher> as Teacher;

    const mockStudent = {
      id: 'student-uuid',
      firstName: 'Jane',
      lastName: 'Smith',
    } as Partial<Student> as Student;

    const mockLesson = {
      id: 'lesson-uuid',
      teacherId: 'teacher-uuid',
      studentId: 'student-uuid',
      startTime: createLessonDto.startTime,
      endTime: createLessonDto.endTime,
      status: LessonStatus.CONFIRMED,
    } as Partial<Lesson> as Lesson;

    it('should create a lesson with CONFIRMED status when creator is teacher', async () => {
      mockTeachersRepository.findOne.mockResolvedValue(mockTeacher);
      mockStudentsRepository.findOne.mockResolvedValue(mockStudent);
      mockLessonsRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });
      mockLessonsRepository.create.mockReturnValue(mockLesson);
      mockLessonsRepository.save.mockResolvedValue(mockLesson);

      const result = await service.createLesson(createLessonDto);

      expect(result).toEqual(mockLesson);
      expect(mockLessonsRepository.create).toHaveBeenCalledWith({
        teacherId: createLessonDto.teacherId,
        studentId: createLessonDto.studentId,
        startTime: createLessonDto.startTime,
        endTime: createLessonDto.endTime,
        status: LessonStatus.CONFIRMED,
      });
    });

    it('should create a lesson with PENDING status when creator is student', async () => {
      const studentCreatedDto = {
        ...createLessonDto,
        creatorRole: UserRole.STUDENT,
      };
      const pendingLesson = { ...mockLesson, status: LessonStatus.PENDING };

      mockTeachersRepository.findOne.mockResolvedValue(mockTeacher);
      mockStudentsRepository.findOne.mockResolvedValue(mockStudent);
      mockLessonsRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });
      mockLessonsRepository.create.mockReturnValue(pendingLesson);
      mockLessonsRepository.save.mockResolvedValue(pendingLesson);

      const result = await service.createLesson(studentCreatedDto);

      expect(result.status).toBe(LessonStatus.PENDING);
    });

    it('should throw NotFoundException if teacher does not exist', async () => {
      mockTeachersRepository.findOne.mockResolvedValue(null);

      await expect(service.createLesson(createLessonDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.createLesson(createLessonDto)).rejects.toThrow(
        'Teacher with id teacher-uuid not found',
      );
    });

    it('should throw NotFoundException if student does not exist', async () => {
      mockTeachersRepository.findOne.mockResolvedValue(mockTeacher);
      mockStudentsRepository.findOne.mockResolvedValue(null);

      await expect(service.createLesson(createLessonDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.createLesson(createLessonDto)).rejects.toThrow(
        'Student with id student-uuid not found',
      );
    });

    it('should throw BadRequestException if student is not assigned to teacher', async () => {
      const teacherWithoutStudent = {
        ...mockTeacher,
        students: [],
      };
      mockTeachersRepository.findOne.mockResolvedValue(teacherWithoutStudent);
      mockStudentsRepository.findOne.mockResolvedValue(mockStudent);

      await expect(service.createLesson(createLessonDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createLesson(createLessonDto)).rejects.toThrow(
        'Student must be assigned to teacher before creating a lesson',
      );
    });

    it('should throw BadRequestException if teacher has conflicting lesson', async () => {
      mockTeachersRepository.findOne.mockResolvedValue(mockTeacher);
      mockStudentsRepository.findOne.mockResolvedValue(mockStudent);

      // Mock teacher overlap detection - first call returns conflict
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockLesson),
      };
      mockLessonsRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      await expect(service.createLesson(createLessonDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createLesson(createLessonDto)).rejects.toThrow(
        'Teacher has a conflicting lesson at this time',
      );
    });

    it('should throw BadRequestException if student has conflicting lesson', async () => {
      mockTeachersRepository.findOne.mockResolvedValue(mockTeacher);
      mockStudentsRepository.findOne.mockResolvedValue(mockStudent);

      // Spy on service methods to control return values
      jest.spyOn(service, 'checkTeacherAvailability').mockResolvedValue(false);
      jest.spyOn(service, 'checkStudentAvailability').mockResolvedValue(true);

      await expect(service.createLesson(createLessonDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.createLesson(createLessonDto)).rejects.toThrow(
        'Student has a conflicting lesson at this time',
      );
    });
  });

  describe('checkTeacherAvailability', () => {
    const teacherId = 'teacher-uuid';
    const startTime = new Date('2025-11-10T10:00:00Z');
    const endTime = new Date('2025-11-10T11:00:00Z');

    it('should return true if there is a conflicting lesson', async () => {
      const mockConflict = { id: 'conflict-uuid' } as Lesson;

      mockLessonsRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockConflict),
      });

      const result = await service.checkTeacherAvailability(
        teacherId,
        startTime,
        endTime,
      );

      expect(result).toBe(true);
    });

    it('should return false if there is no conflicting lesson', async () => {
      mockLessonsRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      const result = await service.checkTeacherAvailability(
        teacherId,
        startTime,
        endTime,
      );

      expect(result).toBe(false);
    });

    it('should exclude a specific lesson when checking availability', async () => {
      const excludeLessonId = 'exclude-uuid';
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      mockLessonsRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      await service.checkTeacherAvailability(
        teacherId,
        startTime,
        endTime,
        excludeLessonId,
      );

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'lesson.id != :excludeLessonId',
        { excludeLessonId },
      );
    });
  });

  describe('checkStudentAvailability', () => {
    const studentId = 'student-uuid';
    const startTime = new Date('2025-11-10T10:00:00Z');
    const endTime = new Date('2025-11-10T11:00:00Z');

    it('should return true if there is a conflicting lesson', async () => {
      const mockConflict = { id: 'conflict-uuid' } as Lesson;

      mockLessonsRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockConflict),
      });

      const result = await service.checkStudentAvailability(
        studentId,
        startTime,
        endTime,
      );

      expect(result).toBe(true);
    });

    it('should return false if there is no conflicting lesson', async () => {
      mockLessonsRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      });

      const result = await service.checkStudentAvailability(
        studentId,
        startTime,
        endTime,
      );

      expect(result).toBe(false);
    });
  });

  describe('findAllLessons', () => {
    const mockLessons = [
      {
        id: 'lesson-1',
        status: LessonStatus.CONFIRMED,
      } as Partial<Lesson> as Lesson,
      {
        id: 'lesson-2',
        status: LessonStatus.PENDING,
      } as Partial<Lesson> as Lesson,
    ];

    it('should return all lessons without filters', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockLessons),
      };

      mockLessonsRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.findAllLessons();

      expect(result).toEqual(mockLessons);
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockLessons[0]]),
      };

      mockLessonsRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      await service.findAllLessons(LessonStatus.CONFIRMED);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'lesson.status = :status',
        { status: LessonStatus.CONFIRMED },
      );
    });

    it('should filter by teacherId', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockLessons),
      };

      mockLessonsRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      await service.findAllLessons(undefined, 'teacher-uuid');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'lesson.teacher_id = :teacherId',
        { teacherId: 'teacher-uuid' },
      );
    });

    it('should filter by studentId', async () => {
      const mockQueryBuilder = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockLessons),
      };

      mockLessonsRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      await service.findAllLessons(undefined, undefined, 'student-uuid');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'lesson.student_id = :studentId',
        { studentId: 'student-uuid' },
      );
    });
  });

  describe('findLessonById', () => {
    const lessonId = 'lesson-uuid';
    const mockLesson = {
      id: lessonId,
      status: LessonStatus.CONFIRMED,
    } as Partial<Lesson> as Lesson;

    it('should return a lesson by id', async () => {
      mockLessonsRepository.findOne.mockResolvedValue(mockLesson);

      const result = await service.findLessonById(lessonId);

      expect(result).toEqual(mockLesson);
      expect(mockLessonsRepository.findOne).toHaveBeenCalledWith({
        where: { id: lessonId },
        relations: ['teacher', 'student'],
      });
    });

    it('should throw NotFoundException if lesson not found', async () => {
      mockLessonsRepository.findOne.mockResolvedValue(null);

      await expect(service.findLessonById(lessonId)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.findLessonById(lessonId)).rejects.toThrow(
        `Lesson with id ${lessonId} not found`,
      );
    });
  });

  describe('findLessonsByTeacher', () => {
    const teacherId = 'teacher-uuid';
    const mockLessons = [
      { id: 'lesson-1' } as Partial<Lesson> as Lesson,
      { id: 'lesson-2' } as Partial<Lesson> as Lesson,
    ];

    it('should return all lessons for a teacher', async () => {
      mockLessonsRepository.find.mockResolvedValue(mockLessons);

      const result = await service.findLessonsByTeacher(teacherId);

      expect(result).toEqual(mockLessons);
      expect(mockLessonsRepository.find).toHaveBeenCalledWith({
        where: { teacherId },
        relations: ['student'],
        order: { startTime: 'DESC' },
      });
    });
  });

  describe('findLessonsByStudent', () => {
    const studentId = 'student-uuid';
    const mockLessons = [
      { id: 'lesson-1' } as Partial<Lesson> as Lesson,
      { id: 'lesson-2' } as Partial<Lesson> as Lesson,
    ];

    it('should return all lessons for a student', async () => {
      mockLessonsRepository.find.mockResolvedValue(mockLessons);

      const result = await service.findLessonsByStudent(studentId);

      expect(result).toEqual(mockLessons);
      expect(mockLessonsRepository.find).toHaveBeenCalledWith({
        where: { studentId },
        relations: ['teacher'],
        order: { startTime: 'DESC' },
      });
    });
  });

  describe('confirmLesson', () => {
    const lessonId = 'lesson-uuid';

    it('should confirm a pending lesson', async () => {
      const mockPendingLesson = {
        id: lessonId,
        status: LessonStatus.PENDING,
      } as Partial<Lesson> as Lesson;

      const mockConfirmedLesson = {
        ...mockPendingLesson,
        status: LessonStatus.CONFIRMED,
      };

      mockLessonsRepository.findOne.mockResolvedValue(mockPendingLesson);
      mockLessonsRepository.save.mockResolvedValue(mockConfirmedLesson);

      const result = await service.confirmLesson(lessonId);

      expect(result.status).toBe(LessonStatus.CONFIRMED);
      expect(mockLessonsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: LessonStatus.CONFIRMED }),
      );
    });

    it('should throw BadRequestException if lesson is not pending', async () => {
      const mockConfirmedLesson = {
        id: lessonId,
        status: LessonStatus.CONFIRMED,
      } as Partial<Lesson> as Lesson;

      mockLessonsRepository.findOne.mockResolvedValue(mockConfirmedLesson);

      await expect(service.confirmLesson(lessonId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.confirmLesson(lessonId)).rejects.toThrow(
        'Only pending lessons can be confirmed',
      );
    });
  });

  describe('rejectLesson', () => {
    const lessonId = 'lesson-uuid';

    it('should reject a pending lesson', async () => {
      const mockPendingLesson = {
        id: lessonId,
        status: LessonStatus.PENDING,
      } as Partial<Lesson> as Lesson;

      const mockRejectedLesson = {
        ...mockPendingLesson,
        status: LessonStatus.CANCELLED,
      };

      mockLessonsRepository.findOne.mockResolvedValue(mockPendingLesson);
      mockLessonsRepository.save.mockResolvedValue(mockRejectedLesson);

      const result = await service.rejectLesson(lessonId);

      expect(result.status).toBe(LessonStatus.CANCELLED);
    });

    it('should throw BadRequestException if lesson is not pending', async () => {
      const mockConfirmedLesson = {
        id: lessonId,
        status: LessonStatus.CONFIRMED,
      } as Partial<Lesson> as Lesson;

      mockLessonsRepository.findOne.mockResolvedValue(mockConfirmedLesson);

      await expect(service.rejectLesson(lessonId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.rejectLesson(lessonId)).rejects.toThrow(
        'Only pending lessons can be rejected',
      );
    });
  });

  describe('completeLesson', () => {
    const lessonId = 'lesson-uuid';

    it('should complete a confirmed lesson', async () => {
      const mockConfirmedLesson = {
        id: lessonId,
        status: LessonStatus.CONFIRMED,
      } as Partial<Lesson> as Lesson;

      const mockCompletedLesson = {
        ...mockConfirmedLesson,
        status: LessonStatus.COMPLETED,
      };

      mockLessonsRepository.findOne.mockResolvedValue(mockConfirmedLesson);
      mockLessonsRepository.save.mockResolvedValue(mockCompletedLesson);

      const result = await service.completeLesson(lessonId);

      expect(result.status).toBe(LessonStatus.COMPLETED);
    });

    it('should throw BadRequestException if lesson is not confirmed', async () => {
      const mockPendingLesson = {
        id: lessonId,
        status: LessonStatus.PENDING,
      } as Partial<Lesson> as Lesson;

      mockLessonsRepository.findOne.mockResolvedValue(mockPendingLesson);

      await expect(service.completeLesson(lessonId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.completeLesson(lessonId)).rejects.toThrow(
        'Only confirmed lessons can be completed',
      );
    });
  });

  describe('cancelLesson', () => {
    const lessonId = 'lesson-uuid';

    it('should cancel a pending lesson', async () => {
      const mockPendingLesson = {
        id: lessonId,
        status: LessonStatus.PENDING,
      } as Partial<Lesson> as Lesson;

      const mockCancelledLesson = {
        ...mockPendingLesson,
        status: LessonStatus.CANCELLED,
      };

      mockLessonsRepository.findOne.mockResolvedValue(mockPendingLesson);
      mockLessonsRepository.save.mockResolvedValue(mockCancelledLesson);

      const result = await service.cancelLesson(lessonId);

      expect(result.status).toBe(LessonStatus.CANCELLED);
    });

    it('should cancel a confirmed lesson', async () => {
      const mockConfirmedLesson = {
        id: lessonId,
        status: LessonStatus.CONFIRMED,
      } as Partial<Lesson> as Lesson;

      const mockCancelledLesson = {
        ...mockConfirmedLesson,
        status: LessonStatus.CANCELLED,
      };

      mockLessonsRepository.findOne.mockResolvedValue(mockConfirmedLesson);
      mockLessonsRepository.save.mockResolvedValue(mockCancelledLesson);

      const result = await service.cancelLesson(lessonId);

      expect(result.status).toBe(LessonStatus.CANCELLED);
    });

    it('should throw BadRequestException if lesson is already cancelled', async () => {
      const mockCancelledLesson = {
        id: lessonId,
        status: LessonStatus.CANCELLED,
      } as Partial<Lesson> as Lesson;

      mockLessonsRepository.findOne.mockResolvedValue(mockCancelledLesson);

      await expect(service.cancelLesson(lessonId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cancelLesson(lessonId)).rejects.toThrow(
        'Lesson is already cancelled',
      );
    });

    it('should throw BadRequestException if lesson is completed', async () => {
      const mockCompletedLesson = {
        id: lessonId,
        status: LessonStatus.COMPLETED,
      } as Partial<Lesson> as Lesson;

      mockLessonsRepository.findOne.mockResolvedValue(mockCompletedLesson);

      await expect(service.cancelLesson(lessonId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.cancelLesson(lessonId)).rejects.toThrow(
        'Cannot cancel a completed lesson',
      );
    });
  });

  describe('deleteLesson', () => {
    const lessonId = 'lesson-uuid';

    it('should delete a lesson', async () => {
      const mockLesson = {
        id: lessonId,
      } as Partial<Lesson> as Lesson;

      mockLessonsRepository.findOne.mockResolvedValue(mockLesson);
      mockLessonsRepository.remove.mockResolvedValue(mockLesson);

      await service.deleteLesson(lessonId);

      expect(mockLessonsRepository.remove).toHaveBeenCalledWith(mockLesson);
    });

    it('should throw NotFoundException if lesson not found', async () => {
      mockLessonsRepository.findOne.mockResolvedValue(null);

      await expect(service.deleteLesson(lessonId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateLessonStatus', () => {
    const lessonId = 'lesson-uuid';

    it('should update lesson status with valid transition', async () => {
      const mockPendingLesson = {
        id: lessonId,
        status: LessonStatus.PENDING,
      } as Partial<Lesson> as Lesson;

      const updateDto: UpdateLessonStatusDto = {
        status: LessonStatus.CONFIRMED,
      };

      mockLessonsRepository.findOne.mockResolvedValue(mockPendingLesson);
      mockLessonsRepository.save.mockResolvedValue({
        ...mockPendingLesson,
        status: LessonStatus.CONFIRMED,
      });

      const result = await service.updateLessonStatus(lessonId, updateDto);

      expect(result.status).toBe(LessonStatus.CONFIRMED);
    });

    it('should throw BadRequestException for invalid status transition', async () => {
      const mockCompletedLesson = {
        id: lessonId,
        status: LessonStatus.COMPLETED,
      } as Partial<Lesson> as Lesson;

      const updateDto: UpdateLessonStatusDto = {
        status: LessonStatus.PENDING,
      };

      mockLessonsRepository.findOne.mockResolvedValue(mockCompletedLesson);

      await expect(
        service.updateLessonStatus(lessonId, updateDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateLessonStatus(lessonId, updateDto),
      ).rejects.toThrow('Cannot modify a completed lesson');
    });

    it('should throw BadRequestException if status is already the target status', async () => {
      const mockConfirmedLesson = {
        id: lessonId,
        status: LessonStatus.CONFIRMED,
      } as Partial<Lesson> as Lesson;

      const updateDto: UpdateLessonStatusDto = {
        status: LessonStatus.CONFIRMED,
      };

      mockLessonsRepository.findOne.mockResolvedValue(mockConfirmedLesson);

      await expect(
        service.updateLessonStatus(lessonId, updateDto),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.updateLessonStatus(lessonId, updateDto),
      ).rejects.toThrow(`Lesson is already ${LessonStatus.CONFIRMED}`);
    });
  });

  describe('Status Transition Validation', () => {
    it('should allow transition from PENDING to CONFIRMED', async () => {
      const mockPendingLesson = {
        id: 'lesson-uuid',
        status: LessonStatus.PENDING,
      } as Partial<Lesson> as Lesson;

      mockLessonsRepository.findOne.mockResolvedValue(mockPendingLesson);
      mockLessonsRepository.save.mockResolvedValue({
        ...mockPendingLesson,
        status: LessonStatus.CONFIRMED,
      });

      await expect(
        service.updateLessonStatus('lesson-uuid', {
          status: LessonStatus.CONFIRMED,
        }),
      ).resolves.not.toThrow();
    });

    it('should allow transition from PENDING to CANCELLED', async () => {
      const mockPendingLesson = {
        id: 'lesson-uuid',
        status: LessonStatus.PENDING,
      } as Partial<Lesson> as Lesson;

      mockLessonsRepository.findOne.mockResolvedValue(mockPendingLesson);
      mockLessonsRepository.save.mockResolvedValue({
        ...mockPendingLesson,
        status: LessonStatus.CANCELLED,
      });

      await expect(
        service.updateLessonStatus('lesson-uuid', {
          status: LessonStatus.CANCELLED,
        }),
      ).resolves.not.toThrow();
    });

    it('should allow transition from CONFIRMED to COMPLETED', async () => {
      const mockConfirmedLesson = {
        id: 'lesson-uuid',
        status: LessonStatus.CONFIRMED,
      } as Partial<Lesson> as Lesson;

      mockLessonsRepository.findOne.mockResolvedValue(mockConfirmedLesson);
      mockLessonsRepository.save.mockResolvedValue({
        ...mockConfirmedLesson,
        status: LessonStatus.COMPLETED,
      });

      await expect(
        service.updateLessonStatus('lesson-uuid', {
          status: LessonStatus.COMPLETED,
        }),
      ).resolves.not.toThrow();
    });

    it('should allow transition from CONFIRMED to CANCELLED', async () => {
      const mockConfirmedLesson = {
        id: 'lesson-uuid',
        status: LessonStatus.CONFIRMED,
      } as Partial<Lesson> as Lesson;

      mockLessonsRepository.findOne.mockResolvedValue(mockConfirmedLesson);
      mockLessonsRepository.save.mockResolvedValue({
        ...mockConfirmedLesson,
        status: LessonStatus.CANCELLED,
      });

      await expect(
        service.updateLessonStatus('lesson-uuid', {
          status: LessonStatus.CANCELLED,
        }),
      ).resolves.not.toThrow();
    });

    it('should reject transition from CANCELLED to any status', async () => {
      const mockCancelledLesson = {
        id: 'lesson-uuid',
        status: LessonStatus.CANCELLED,
      } as Partial<Lesson> as Lesson;

      mockLessonsRepository.findOne.mockResolvedValue(mockCancelledLesson);

      await expect(
        service.updateLessonStatus('lesson-uuid', {
          status: LessonStatus.CONFIRMED,
        }),
      ).rejects.toThrow(
        `Cannot transition from ${LessonStatus.CANCELLED} to ${LessonStatus.CONFIRMED}`,
      );
    });

    it('should reject transition from COMPLETED to any status', async () => {
      const mockCompletedLesson = {
        id: 'lesson-uuid',
        status: LessonStatus.COMPLETED,
      } as Partial<Lesson> as Lesson;

      mockLessonsRepository.findOne.mockResolvedValue(mockCompletedLesson);

      await expect(
        service.updateLessonStatus('lesson-uuid', {
          status: LessonStatus.CONFIRMED,
        }),
      ).rejects.toThrow('Cannot modify a completed lesson');
    });
  });
});
