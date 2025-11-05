import { ChildEntity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Student } from './student.entity';
import { Lesson } from './lesson.entity';
import { Instrument } from './instrument.enum';

@ChildEntity('teacher')
export class Teacher extends User {
  @Column({
    type: 'enum',
    enum: Instrument,
  })
  instrument!: Instrument;

  @Column({ type: 'integer', default: 0 })
  experience!: number;

  @ManyToMany(() => Student, (student: Student) => student.teachers, {
    cascade: false,
  })
  @JoinTable({
    name: 'teacher_students',
    joinColumn: { name: 'teacher_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'student_id', referencedColumnName: 'id' },
  })
  students!: Student[];

  @OneToMany(() => Lesson, (lesson: Lesson) => lesson.teacher)
  lessons!: Lesson[];
}
