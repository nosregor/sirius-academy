import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { Lesson, LessonStatus } from '@entities/lesson.entity';
import { Teacher } from '@entities/teacher.entity';
import { Student } from '@entities/student.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonStatusDto } from './dto/update-lesson-status.dto';
import { UserRole } from '@entities/user.entity';

/**
 * LessonsService
 *
 * Handles business logic for lesson operations including:
 * - Dual workflow (teacher-created vs student-requested)
 * - Overlap detection for teachers and students
 * - Status transitions
 * - Relationship validation
 */
@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(Teacher)
    private readonly teachersRepository: Repository<Teacher>,
    @InjectRepository(Student)
    private readonly studentsRepository: Repository<Student>,
  ) {}

  /**
   * Create a new lesson with dual workflow logic
   * - Teacher-created lessons → confirmed status
   * - Student-created lessons → pending status
   * Validates teacher/student existence and assignment relationship
   * Checks for schedule overlaps
   */
  async createLesson(createLessonDto: CreateLessonDto): Promise<Lesson> {
    const { teacherId, studentId, startTime, endTime, creatorRole } =
      createLessonDto;

    // Validate teacher exists
    const teacher = await this.teachersRepository.findOne({
      where: { id: teacherId },
      relations: ['students'],
    });

    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${teacherId} not found`);
    }

    // Validate student exists
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
    });

    if (!student) {
      throw new NotFoundException(`Student with id ${studentId} not found`);
    }

    // Validate student is assigned to teacher
    const isAssigned = teacher.students.some((s) => s.id === studentId);
    if (!isAssigned) {
      throw new BadRequestException(
        'Student must be assigned to teacher before creating a lesson',
      );
    }

    // Check for teacher schedule conflicts
    const teacherHasConflict = await this.checkTeacherAvailability(
      teacherId,
      startTime,
      endTime,
    );

    if (teacherHasConflict) {
      throw new BadRequestException(
        'Teacher has a conflicting lesson at this time',
      );
    }

    // Check for student schedule conflicts
    const studentHasConflict = await this.checkStudentAvailability(
      studentId,
      startTime,
      endTime,
    );

    if (studentHasConflict) {
      throw new BadRequestException(
        'Student has a conflicting lesson at this time',
      );
    }

    // Determine initial status based on creator role
    const initialStatus =
      creatorRole === UserRole.TEACHER
        ? LessonStatus.CONFIRMED
        : LessonStatus.PENDING;

    // Create lesson
    const lesson = this.lessonsRepository.create({
      teacherId,
      studentId,
      startTime,
      endTime,
      status: initialStatus,
    });

    try {
      return await this.lessonsRepository.save(lesson);
    } catch (error) {
      this.handleDatabaseError(error, 'Failed to create lesson');
    }
  }

  /**
   * Check if teacher has any overlapping lessons
   * Returns true if there's a conflict, false otherwise
   */
  async checkTeacherAvailability(
    teacherId: string,
    startTime: Date,
    endTime: Date,
    excludeLessonId?: string,
  ): Promise<boolean> {
    const queryBuilder = this.lessonsRepository
      .createQueryBuilder('lesson')
      .where('lesson.teacher_id = :teacherId', { teacherId })
      .andWhere('lesson.status IN (:...statuses)', {
        statuses: [LessonStatus.CONFIRMED, LessonStatus.PENDING],
      })
      .andWhere(
        '(lesson.start_time < :endTime AND lesson.end_time > :startTime)',
        {
          startTime,
          endTime,
        },
      );

    // Exclude a specific lesson (useful for updates)
    if (excludeLessonId) {
      queryBuilder.andWhere('lesson.id != :excludeLessonId', {
        excludeLessonId,
      });
    }

    const conflictingLesson = await queryBuilder.getOne();
    return !!conflictingLesson;
  }

  /**
   * Check if student has any overlapping lessons
   * Returns true if there's a conflict, false otherwise
   */
  async checkStudentAvailability(
    studentId: string,
    startTime: Date,
    endTime: Date,
    excludeLessonId?: string,
  ): Promise<boolean> {
    const queryBuilder = this.lessonsRepository
      .createQueryBuilder('lesson')
      .where('lesson.student_id = :studentId', { studentId })
      .andWhere('lesson.status IN (:...statuses)', {
        statuses: [LessonStatus.CONFIRMED, LessonStatus.PENDING],
      })
      .andWhere(
        '(lesson.start_time < :endTime AND lesson.end_time > :startTime)',
        {
          startTime,
          endTime,
        },
      );

    // Exclude a specific lesson (useful for updates)
    if (excludeLessonId) {
      queryBuilder.andWhere('lesson.id != :excludeLessonId', {
        excludeLessonId,
      });
    }

    const conflictingLesson = await queryBuilder.getOne();
    return !!conflictingLesson;
  }

  /**
   * Retrieve all lessons with optional filtering
   * @param status - Filter by lesson status
   * @param teacherId - Filter by teacher
   * @param studentId - Filter by student
   */
  async findAllLessons(
    status?: LessonStatus,
    teacherId?: string,
    studentId?: string,
  ): Promise<Lesson[]> {
    const queryBuilder = this.lessonsRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.teacher', 'teacher')
      .leftJoinAndSelect('lesson.student', 'student')
      .orderBy('lesson.start_time', 'DESC');

    if (status) {
      queryBuilder.andWhere('lesson.status = :status', { status });
    }

    if (teacherId) {
      queryBuilder.andWhere('lesson.teacher_id = :teacherId', { teacherId });
    }

    if (studentId) {
      queryBuilder.andWhere('lesson.student_id = :studentId', { studentId });
    }

    return queryBuilder.getMany();
  }

  /**
   * Retrieve a single lesson by ID
   * @param id - Lesson UUID
   * @throws NotFoundException if lesson is not found
   */
  async findLessonById(id: string): Promise<Lesson> {
    const lesson = await this.lessonsRepository.findOne({
      where: { id },
      relations: ['teacher', 'student'],
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson with id ${id} not found`);
    }

    return lesson;
  }

  /**
   * Retrieve all lessons for a specific teacher
   * @param teacherId - Teacher UUID
   */
  async findLessonsByTeacher(teacherId: string): Promise<Lesson[]> {
    return this.lessonsRepository.find({
      where: { teacherId },
      relations: ['student'],
      order: { startTime: 'DESC' },
    });
  }

  /**
   * Retrieve all lessons for a specific student
   * @param studentId - Student UUID
   */
  async findLessonsByStudent(studentId: string): Promise<Lesson[]> {
    return this.lessonsRepository.find({
      where: { studentId },
      relations: ['teacher'],
      order: { startTime: 'DESC' },
    });
  }

  /**
   * Confirm a pending lesson (teacher action)
   * Transition: pending → confirmed
   */
  async confirmLesson(id: string): Promise<Lesson> {
    const lesson = await this.findLessonById(id);

    if (lesson.status !== LessonStatus.PENDING) {
      throw new BadRequestException('Only pending lessons can be confirmed');
    }

    lesson.status = LessonStatus.CONFIRMED;

    try {
      return await this.lessonsRepository.save(lesson);
    } catch (error) {
      this.handleDatabaseError(error, 'Failed to confirm lesson');
    }
  }

  /**
   * Reject a pending lesson (teacher action)
   * Transition: pending → cancelled
   */
  async rejectLesson(id: string): Promise<Lesson> {
    const lesson = await this.findLessonById(id);

    if (lesson.status !== LessonStatus.PENDING) {
      throw new BadRequestException('Only pending lessons can be rejected');
    }

    lesson.status = LessonStatus.CANCELLED;

    try {
      return await this.lessonsRepository.save(lesson);
    } catch (error) {
      this.handleDatabaseError(error, 'Failed to reject lesson');
    }
  }

  /**
   * Complete a confirmed lesson
   * Transition: confirmed → completed
   */
  async completeLesson(id: string): Promise<Lesson> {
    const lesson = await this.findLessonById(id);

    if (lesson.status !== LessonStatus.CONFIRMED) {
      throw new BadRequestException('Only confirmed lessons can be completed');
    }

    lesson.status = LessonStatus.COMPLETED;

    try {
      return await this.lessonsRepository.save(lesson);
    } catch (error) {
      this.handleDatabaseError(error, 'Failed to complete lesson');
    }
  }

  /**
   * Cancel a lesson (any status → cancelled)
   */
  async cancelLesson(id: string): Promise<Lesson> {
    const lesson = await this.findLessonById(id);

    if (lesson.status === LessonStatus.CANCELLED) {
      throw new BadRequestException('Lesson is already cancelled');
    }

    if (lesson.status === LessonStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed lesson');
    }

    lesson.status = LessonStatus.CANCELLED;

    try {
      return await this.lessonsRepository.save(lesson);
    } catch (error) {
      this.handleDatabaseError(error, 'Failed to cancel lesson');
    }
  }

  /**
   * Delete a lesson (hard delete)
   * @param id - Lesson UUID
   */
  async deleteLesson(id: string): Promise<void> {
    const lesson = await this.findLessonById(id);
    await this.lessonsRepository.remove(lesson);
  }

  /**
   * Update lesson status with validation
   * @param id - Lesson UUID
   * @param updateLessonStatusDto - New status
   */
  async updateLessonStatus(
    id: string,
    updateLessonStatusDto: UpdateLessonStatusDto,
  ): Promise<Lesson> {
    const lesson = await this.findLessonById(id);
    const { status: newStatus } = updateLessonStatusDto;

    // Validate status transition
    this.validateStatusTransition(lesson.status, newStatus);

    lesson.status = newStatus;

    try {
      return await this.lessonsRepository.save(lesson);
    } catch (error) {
      this.handleDatabaseError(error, 'Failed to update lesson status');
    }
  }

  /**
   * Validate status transition rules
   * Prevents invalid status changes
   */
  private validateStatusTransition(
    currentStatus: LessonStatus,
    newStatus: LessonStatus,
  ): void {
    // Can't change if already in the target status
    if (currentStatus === newStatus) {
      throw new BadRequestException(`Lesson is already ${newStatus}`);
    }

    // Can't change completed lessons
    if (currentStatus === LessonStatus.COMPLETED) {
      throw new BadRequestException('Cannot modify a completed lesson');
    }

    // Validate valid transitions
    const validTransitions: Record<LessonStatus, LessonStatus[]> = {
      [LessonStatus.PENDING]: [LessonStatus.CONFIRMED, LessonStatus.CANCELLED],
      [LessonStatus.CONFIRMED]: [
        LessonStatus.COMPLETED,
        LessonStatus.CANCELLED,
      ],
      [LessonStatus.CANCELLED]: [], // Can't transition from cancelled
      [LessonStatus.COMPLETED]: [], // Can't transition from completed
    };

    const allowedTransitions = validTransitions[currentStatus];

    if (!allowedTransitions.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
      );
    }
  }

  /**
   * Handle database errors with appropriate exception types
   */
  private handleDatabaseError(error: unknown, message: string): never {
    if (error instanceof QueryFailedError) {
      throw new BadRequestException(message);
    }
    throw error;
  }
}
