import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Check,
  Index,
} from 'typeorm';
import { Teacher } from './teacher.entity';
import { Student } from './student.entity';

export enum LessonStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

@Entity('lessons')
@Check(`"end_time" > "start_time"`)
@Check(
  `EXTRACT(EPOCH FROM ("end_time" - "start_time")) >= 900 AND EXTRACT(EPOCH FROM ("end_time" - "start_time")) <= 14400`,
)
@Check(`EXTRACT(MINUTE FROM "start_time") % 15 = 0`)
@Index(['teacherId', 'startTime'])
@Index(['studentId', 'startTime'])
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

  @Index()
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

  @ManyToOne(() => Teacher, (teacher: Teacher) => teacher.lessons, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'teacher_id' })
  teacher?: Teacher;

  @ManyToOne(() => Student, (student: Student) => student.lessons, {
    onDelete: 'CASCADE',
    eager: false,
  })
  @JoinColumn({ name: 'student_id' })
  student?: Student;

  getDurationMinutes(): number {
    const diffMs = this.endTime.getTime() - this.startTime.getTime();
    return Math.floor(diffMs / 60000);
  }

  isValidDuration(): boolean {
    const duration = this.getDurationMinutes();
    return duration >= 15 && duration <= 240;
  }

  isValidTimeSlot(): boolean {
    return this.startTime.getMinutes() % 15 === 0;
  }
}
