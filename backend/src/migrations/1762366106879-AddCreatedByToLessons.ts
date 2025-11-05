import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCreatedByToLessons1762366106879 implements MigrationInterface {
  name = 'AddCreatedByToLessons1762366106879';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create the enum type
    await queryRunner.query(
      `CREATE TYPE "public"."lessons_created_by_enum" AS ENUM('teacher', 'student')`,
    );

    // Add column as nullable first
    await queryRunner.query(
      `ALTER TABLE "lessons" ADD "created_by" "public"."lessons_created_by_enum"`,
    );

    // Set default values for existing records based on status
    // PENDING = student-created, CONFIRMED/COMPLETED/CANCELLED = assume teacher-created
    await queryRunner.query(`
            UPDATE "lessons"
            SET "created_by" = CASE
                WHEN "status" = 'pending' THEN 'student'::lessons_created_by_enum
                ELSE 'teacher'::lessons_created_by_enum
            END
            WHERE "created_by" IS NULL
        `);

    // Now make it NOT NULL
    await queryRunner.query(
      `ALTER TABLE "lessons" ALTER COLUMN "created_by" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "lessons" DROP COLUMN "created_by"`);
    await queryRunner.query(`DROP TYPE "public"."lessons_created_by_enum"`);
  }
}
