import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1762339145322 implements MigrationInterface {
    name = 'InitialSchema1762339145322'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('teacher', 'student')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."users_role_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."lessons_status_enum" AS ENUM('pending', 'confirmed', 'cancelled', 'completed')`);
        await queryRunner.query(`CREATE TABLE "lessons" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "teacher_id" uuid NOT NULL, "student_id" uuid NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "status" "public"."lessons_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_c14c39a88aebe87981374d518b" CHECK (EXTRACT(MINUTE FROM "start_time") % 15 = 0), CONSTRAINT "CHK_b94c1d8a125641b82bd83831f2" CHECK (EXTRACT(EPOCH FROM ("end_time" - "start_time")) >= 900 AND EXTRACT(EPOCH FROM ("end_time" - "start_time")) <= 14400), CONSTRAINT "CHK_282f358938d6a44e732d56e8cd" CHECK ("end_time" > "start_time"), CONSTRAINT "PK_9b9a8d455cac672d262d7275730" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."students_role_enum" AS ENUM('teacher', 'student')`);
        await queryRunner.query(`CREATE TABLE "students" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."students_role_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "instrument" character varying(100) NOT NULL, CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."teachers_role_enum" AS ENUM('teacher', 'student')`);
        await queryRunner.query(`CREATE TABLE "teachers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "firstName" character varying(100) NOT NULL, "lastName" character varying(100) NOT NULL, "password" character varying(255) NOT NULL, "role" "public"."teachers_role_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "instrument" character varying(100) NOT NULL, "experience" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_a8d4f83be3abe4c687b0a0093c8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "teacher_students" ("teacher_id" uuid NOT NULL, "student_id" uuid NOT NULL, CONSTRAINT "PK_6b96abacd4096c17e309883358b" PRIMARY KEY ("teacher_id", "student_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_328c82890a2e85fca6e82f49a5" ON "teacher_students" ("teacher_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8378666b935ffb8f64262580fc" ON "teacher_students" ("student_id") `);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_91eb3280b50fe17091b191bbd98" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "lessons" ADD CONSTRAINT "FK_3bc5bfec4b380597fc4e0042e1b" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "teacher_students" ADD CONSTRAINT "FK_328c82890a2e85fca6e82f49a5c" FOREIGN KEY ("teacher_id") REFERENCES "teachers"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "teacher_students" ADD CONSTRAINT "FK_8378666b935ffb8f64262580fc4" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "teacher_students" DROP CONSTRAINT "FK_8378666b935ffb8f64262580fc4"`);
        await queryRunner.query(`ALTER TABLE "teacher_students" DROP CONSTRAINT "FK_328c82890a2e85fca6e82f49a5c"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_3bc5bfec4b380597fc4e0042e1b"`);
        await queryRunner.query(`ALTER TABLE "lessons" DROP CONSTRAINT "FK_91eb3280b50fe17091b191bbd98"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8378666b935ffb8f64262580fc"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_328c82890a2e85fca6e82f49a5"`);
        await queryRunner.query(`DROP TABLE "teacher_students"`);
        await queryRunner.query(`DROP TABLE "teachers"`);
        await queryRunner.query(`DROP TYPE "public"."teachers_role_enum"`);
        await queryRunner.query(`DROP TABLE "students"`);
        await queryRunner.query(`DROP TYPE "public"."students_role_enum"`);
        await queryRunner.query(`DROP TABLE "lessons"`);
        await queryRunner.query(`DROP TYPE "public"."lessons_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
