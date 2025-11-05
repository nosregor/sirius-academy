import { ChildEntity, Column, ManyToMany, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Teacher } from './teacher.entity';
import { Lesson } from './lesson.entity';
import { Instrument } from './instrument.enum';

@ChildEntity('student')
export class Student extends User {
  @Column({
    type: 'enum',
    enum: Instrument,
  })
  instrument!: Instrument;

  @ManyToMany(() => Teacher, (teacher: Teacher) => teacher.students)
  teachers!: Teacher[];

  @OneToMany(() => Lesson, (lesson: Lesson) => lesson.student)
  lessons!: Lesson[];
}
