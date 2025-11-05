import { ChildEntity, Column, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Student } from './student.entity';
import { Lesson } from './lesson.entity';

/**
 * Teacher entity
 * Uses Single Table Inheritance - stored in 'users' table with type discriminator
 * Extends User entity with teacher-specific fields and relationships
 */
@ChildEntity('Teacher')
export class Teacher extends User {
  @Column({ type: 'varchar', length: 100 })
  instrument!: string;

  @Column({ type: 'integer', default: 0 })
  experience!: number;

  /**
   * Many-to-Many relationship with students
   * Teachers can have multiple students, and students can have multiple students
   * Initialized as empty array - populated when relations are loaded
   */
  @ManyToMany(() => Student, (student: Student) => student.teachers, {
    cascade: false,
  })
  @JoinTable({
    name: 'teacher_students',
    joinColumn: { name: 'teacher_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'student_id', referencedColumnName: 'id' },
  })
  students: Student[] = [];

  /**
   * One-to-Many relationship with lessons
   * A teacher can have many lessons
   * Initialized as empty array - populated when relations are loaded
   */
  @OneToMany(() => Lesson, (lesson: Lesson) => lesson.teacher)
  lessons: Lesson[] = [];
}
