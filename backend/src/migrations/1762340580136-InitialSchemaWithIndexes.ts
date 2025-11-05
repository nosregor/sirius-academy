import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Initial schema migration with Single Table Inheritance and Performance Indexes
 *
 * Creates:
 * - users table (with STI discriminator 'type' for teachers/students)
 * - lessons table (with time slot and duration constraints)
 * - teacher_students join table (many-to-many relationship)
 *
 * Performance Indexes:
 * - users.role - Filter by user role
 * - users.deletedAt - Soft delete queries
 * - users.type - STI discriminator queries
 * - lessons.status - Filter by lesson status
 * - lessons.teacher_id + start_time (composite) - Teacher schedule queries
 * - lessons.student_id + start_time (composite) - Student schedule queries
 * - teacher_students.teacher_id - Join performance
 * - teacher_students.student_id - Join performance
 *
 * Features:
 * - Password hashing support with isPasswordHashed flag
 * - Soft delete support with deletedAt column and index
 * - Database-level constraints for lesson duration (15 min - 4 hours)
 * - 15-minute time slot validation
 */
export class InitialSchemaWithIndexes1762340580136
  implements MigrationInterface
{
  name = 'InitialSchemaWithIndexes1762340580136';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."users_role_enum" AS ENUM('teacher', 'student')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."users_type_enum" AS ENUM('teacher', 'student')`,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL, "isPasswordHashed" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "instrument" character varying(100), "experience" integer DEFAULT '0', "type" "public"."users_type_enum" NOT NULL, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ace513fa30d485cfd25c11a9e4" ON "users" ("role") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2a32f641edba1d0f973c19cc94" ON "users" ("deletedAt") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_94e2000b5f7ee1f9c491f0f8a8" ON "users" ("type") `,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."lessons_status_enum" AS ENUM('pending', 'confirmed', 'cancelled', 'completed')`,
    );
    await queryRunner.query(
      `CREATE TABLE "lessons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "teacher_id" uuid NOT NULL, "student_id" uuid NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "status" "public"."lessons_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_c14c39a88aebe87981374d518b" CHECK (EXTRACT(MINUTE FROM "start_time") % 15 = 0), CONSTRAINT "CHK_b94c1d8a125641b82bd83831f2" CHECK (EXTRACT(EPOCH FROM ("end_time" - "start_time")) >= 900 AND EXTRACT(EPOCH FROM ("end_time" - "start_time")) <= 14400), CONSTRAINT "CHK_282f358938d6a44e732d56e8cd" CHECK ("end_time" > "start_time"), CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_913c2193a312392325ec82ea21" ON "lessons" ("status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_48513be3184763fcc671490681" ON "lessons" ("student_id", "start_time") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ac33d6fe35d2302be9b18b18d2" ON "lessons" ("teacher_id", "start_time") `,
    );
    await queryRunner.query(
      `CREATE TABLE "teacher_students" ("teacher_id" uuid NOT NULL, "student_id" uuid NOT NULL, CONSTRAINT "PK_6b96abacd4096c17e309883358b" PRIMARY KEY ("teacher_id", "student_id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_328c82890a2e85fca6e82f49a5" ON "teacher_students" ("teacher_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8378666b935ffb8f64262580fc" ON "teacher_students" ("student_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD CONSTRAINT "FK_91eb3280b50fe17091b191bbd98" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD CONSTRAINT "FK_3bc5bfec4b380597fc4e0042e1b" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "teacher_students" ADD CONSTRAINT "FK_328c82890a2e85fca6e82f49a5c" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "teacher_students" ADD CONSTRAINT "FK_8378666b935ffb8f64262580fc4" FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  /**
   * Rollback migration - DESTROYS ALL DATA
   *
   * ⚠️ CRITICAL WARNING ⚠️
   * This will permanently delete:
   * - All users (teachers and students)
   * - All lessons
   * - All teacher-student relationships
   *
   * NEVER run this in production without:
   * 1. Full database backup
   * 2. Data export to CSV/JSON
   * 3. Team notification
   * 4. Maintenance window scheduled
   *
   * For production, prefer creating a new migration to fix issues
   * rather than rolling back.
   */
  public async down(queryRunner: QueryRunner): Promise<void> {
    // Log warning
    console.warn(
      '⚠️  WARNING: Running down migration - THIS WILL DELETE ALL DATA!',
    );
    console.warn('⚠️  Press Ctrl+C within 5 seconds to cancel...');

    // Safety delay (only in non-test environments)
    if (process.env.NODE_ENV !== 'test') {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    console.log('Proceeding with migration rollback...');
    await queryRunner.query(
      `ALTER TABLE "teacher_students" DROP CONSTRAINT "FK_8378666b935ffb8f64262580fc4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "teacher_students" DROP CONSTRAINT "FK_328c82890a2e85fca6e82f49a5c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" DROP CONSTRAINT "FK_3bc5bfec4b380597fc4e0042e1b"`,
    );
    await queryRunner.query(
      `ALTER TABLE "lessons" DROP CONSTRAINT "FK_91eb3280b50fe17091b191bbd98"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8378666b935ffb8f64262580fc"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_328c82890a2e85fca6e82f49a5"`,
    );
    await queryRunner.query(`DROP TABLE "teacher_students"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ac33d6fe35d2302be9b18b18d2"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_48513be3184763fcc671490681"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_913c2193a312392325ec82ea21"`,
    );
    await queryRunner.query(`DROP TABLE "lessons"`);
    await queryRunner.query(`DROP TYPE "public"."lessons_status_enum"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_94e2000b5f7ee1f9c491f0f8a8"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_2a32f641edba1d0f973c19cc94"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_ace513fa30d485cfd25c11a9e4"`,
    );
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TYPE "public"."users_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
  }
}
