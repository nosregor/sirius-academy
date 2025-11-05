import { ChildEntity, Column, ManyToMany, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Teacher } from './teacher.entity';
import { Lesson } from './lesson.entity';

/**
 * Student entity
 * Uses Single Table Inheritance - stored in 'users' table with type discriminator
 * Extends User entity with student-specific fields and relationships
 */
@ChildEntity()
export class Student extends User {
  @Column({ type: 'varchar', length: 100 })
  instrument!: string;

  /**
   * Many-to-Many relationship with teachers
   * Students can have multiple teachers, and teachers can have multiple students
   */
  @ManyToMany(() => Teacher, (teacher: Teacher) => teacher.students)
  teachers!: Teacher[];

  /**
   * One-to-Many relationship with lessons
   * A student can have many lessons
   */
  @OneToMany(() => Lesson, (lesson: Lesson) => lesson.student)
  lessons!: Lesson[];
}
