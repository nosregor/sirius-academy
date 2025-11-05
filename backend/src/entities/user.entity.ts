import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
  TableInheritance,
  Index,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

/**
 * User role enumeration
 */
export enum UserRole {
  TEACHER = 'teacher',
  STUDENT = 'student',
}

/**
 * Base User entity
 * Uses Single Table Inheritance (STI) with discriminator column
 * Teacher and Student entities extend this using @ChildEntity
 */
@Entity('users')
@TableInheritance({
  column: { type: 'enum', name: 'type', enum: ['Teacher', 'Student'] },
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  @Index()
  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @Column({ type: 'boolean', default: false, select: false })
  isPasswordHashed!: boolean;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Index()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;

  /**
   * Hash password before inserting into database
   */
  @BeforeInsert()
  async hashPasswordBeforeInsert(): Promise<void> {
    if (this.password && !this.isPasswordHashed) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
      this.password = await bcrypt.hash(this.password, saltRounds);
      this.isPasswordHashed = true;
    }
  }

  /**
   * Hash password before updating if it has changed
   */
  @BeforeUpdate()
  async hashPasswordBeforeUpdate(): Promise<void> {
    // Only hash if password has been modified and isn't already hashed
    if (this.password && !this.isPasswordHashed) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
      this.password = await bcrypt.hash(this.password, saltRounds);
      this.isPasswordHashed = true;
    }
  }

  /**
   * Validate password against hashed password
   * @param plainPassword - Plain text password to validate
   * @returns Promise<boolean> - True if password matches
   */
  async validatePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }
}
