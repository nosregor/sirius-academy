import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { Student } from './student.entity';

/**
 * Lesson status enumeration
 */
export enum LessonStatus {
  PENDING = 'pending', // Student-requested, awaiting teacher confirmation
  CONFIRMED = 'confirmed', // Teacher-confirmed or teacher-created
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

/**
 * Lesson entity
 * Represents a scheduled lesson between a teacher and student
 * Includes database constraints for duration and time slot validation
 */
@Entity('lessons')
@Check(`"end_time" > "start_time"`)
@Check(
  `EXTRACT(EPOCH FROM ("end_time" - "start_time")) >= 900 AND EXTRACT(EPOCH FROM ("end_time" - "start_time")) <= 14400`,
)
@Check(`EXTRACT(MINUTE FROM "start_time") % 15 = 0`)
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'teacher_id' })
  teacherId!: string;

  @Column({ type: 'uuid', name: 'student_id' })
  studentId!: string;

  @Column({ type: 'timestamp', name: 'start_time' })
  startTime!: Date;

  @Column({ type: 'timestamp', name: 'end_time' })
  endTime!: Date;

  @Column({
    type: 'enum',
    enum: LessonStatus,
    default: LessonStatus.PENDING,
  })
  status!: LessonStatus;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
  updatedAt!: Date;

  /**
   * Many-to-One relationship with Teacher
   */
  @ManyToOne(() => Teacher, (teacher: Teacher) => teacher.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher!: Teacher;

  /**
   * Many-to-One relationship with Student
   */
  @ManyToOne(() => Student, (student: Student) => student.lessons, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  /**
   * Get lesson duration in minutes
   */
  getDurationMinutes(): number {
    const diffMs = this.endTime.getTime() - this.startTime.getTime();
    return Math.floor(diffMs / 60000);
  }

  /**
   * Validate lesson duration (15 min - 4 hours)
   */
  isValidDuration(): boolean {
    const duration = this.getDurationMinutes();
    return duration >= 15 && duration <= 240;
  }

  /**
   * Validate start time is on 15-minute increment
   */
  isValidTimeSlot(): boolean {
    return this.startTime.getMinutes() % 15 === 0;
  }
}
