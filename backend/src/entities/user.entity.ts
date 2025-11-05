import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  BeforeInsert,
  BeforeUpdate,
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
 * Serves as a parent entity for Teacher and Student with common fields
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 100 })
  firstName!: string;

  @Column({ type: 'varchar', length: 100 })
  lastName!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt!: Date | null;

  /**
   * Hash password before inserting into database
   */
  @BeforeInsert()
  async hashPasswordBeforeInsert(): Promise<void> {
    if (this.password) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  /**
   * Hash password before updating if it has changed
   */
  @BeforeUpdate()
  async hashPasswordBeforeUpdate(): Promise<void> {
    // Only hash if password has been modified and isn't already hashed
    if (this.password && !this.password.startsWith('$2b$')) {
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);
      this.password = await bcrypt.hash(this.password, saltRounds);
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
