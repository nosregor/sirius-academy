import 'reflect-metadata';
import { dataSource } from '../../config/database.config';
import { Teacher } from '../../entities/teacher.entity';
import { Student } from '../../entities/student.entity';
import { Lesson, LessonStatus } from '../../entities/lesson.entity';

type SeedResult = {
  teacherIds: string[];
  studentIds: string[];
  lessonIds: string[];
};

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60000);
}

function pickOne<T>(arr: readonly T[]): T {
  return arr[getRandomInt(0, arr.length - 1)]!;
}

function roundToQuarterHour(date: Date): Date {
  const d = new Date(date);
  d.setSeconds(0, 0);
  const minutes = d.getMinutes();
  const rounded = Math.floor(minutes / 15) * 15;
  d.setMinutes(rounded);

  return d;
}

async function clearTables(): Promise<void> {
  const runner = dataSource.createQueryRunner();
  await runner.connect();
  try {
    await runner.startTransaction();
    // Order matters. TRUNCATE with CASCADE ensures FK integrity.
    await runner.query('TRUNCATE TABLE "lessons" RESTART IDENTITY CASCADE');
    await runner.query(
      'TRUNCATE TABLE "teacher_students" RESTART IDENTITY CASCADE',
    );
    await runner.query('TRUNCATE TABLE "users" RESTART IDENTITY CASCADE');
    await runner.commitTransaction();
  } catch (err) {
    await runner.rollbackTransaction();
    throw err;
  } finally {
    await runner.release();
  }
}

async function seedTeachers(count: number): Promise<Teacher[]> {
  const instruments = ['Piano', 'Guitar', 'Violin', 'Voice', 'Drums', 'Bass'];
  const teacherRepo = dataSource.getRepository(Teacher);
  const teachers: Teacher[] = [];
  for (let i = 0; i < count; i++) {
    const t = teacherRepo.create({
      firstName: `Teacher${i + 1}`,
      lastName: 'Test',
      password: 'password123',
      role: 'teacher',
      instrument: instruments[i % instruments.length],
      experience: getRandomInt(1, 20),
    } as Teacher);
    teachers.push(t);
  }
  return teacherRepo.save(teachers);
}

async function seedStudents(count: number): Promise<Student[]> {
  const instruments = ['Piano', 'Guitar', 'Violin', 'Voice', 'Drums', 'Bass'];
  const studentRepo = dataSource.getRepository(Student);
  const students: Student[] = [];
  for (let i = 0; i < count; i++) {
    const s = studentRepo.create({
      firstName: `Student${i + 1}`,
      lastName: 'Test',
      password: 'password123',
      role: 'student',
      instrument: instruments[i % instruments.length],
    } as Student);
    students.push(s);
  }
  return studentRepo.save(students);
}

async function assignTeachers(
  students: Student[],
  teachers: Teacher[],
): Promise<void> {
  const studentRepo = dataSource.getRepository(Student);
  for (const student of students) {
    const numTeachers = getRandomInt(1, Math.min(3, teachers.length));
    const shuffled = [...teachers].sort(() => Math.random() - 0.5);
    student.teachers = shuffled.slice(0, numTeachers);
    await studentRepo.save(student);
  }
}

function generateLessonWindows(): Array<{ start: Date; end: Date }> {
  const windows: Array<{ start: Date; end: Date }> = [];
  const base = roundToQuarterHour(new Date());
  base.setHours(9, 0, 0, 0);
  for (let d = 0; d < 5; d++) {
    for (let h = 0; h < 7; h++) {
      const start = addMinutes(addMinutes(new Date(base), d * 24 * 60), h * 60);
      const durationOptions = [30, 45, 60, 90] as const;
      const duration = pickOne(durationOptions);
      const end = addMinutes(start, duration);
      windows.push({ start, end });
    }
  }
  return windows;
}

async function seedLessons(
  targetCount: number,
  teachers: Teacher[],
  students: Student[],
): Promise<Lesson[]> {
  const lessonRepo = dataSource.getRepository(Lesson);
  const windows = generateLessonWindows();
  const lessons: Lesson[] = [];

  for (let i = 0; i < targetCount; i++) {
    const teacher = teachers[getRandomInt(0, teachers.length - 1)]!;
    const student = students[getRandomInt(0, students.length - 1)]!;
    const w = windows[getRandomInt(0, windows.length - 1)]!;
    const { start, end } = w;

    const statusPool: LessonStatus[] = [
      LessonStatus.PENDING,
      LessonStatus.CONFIRMED,
      LessonStatus.CONFIRMED,
      LessonStatus.COMPLETED,
      LessonStatus.CANCELLED,
    ];
    const status = statusPool[getRandomInt(0, statusPool.length - 1)];

    const l = lessonRepo.create({
      teacherId: teacher.id,
      studentId: student.id,
      startTime: start,
      endTime: end,
      status,
    } as Lesson);
    lessons.push(l);
  }

  return lessonRepo.save(lessons);
}

async function run(): Promise<SeedResult> {
  await dataSource.initialize();
  try {
    console.log('Seeding database...');
    await clearTables();

    const teachers = await seedTeachers(10);
    const students = await seedStudents(30);
    await assignTeachers(students, teachers);
    const lessons = await seedLessons(50, teachers, students);

    console.log('Seeding complete.');
    return {
      teacherIds: teachers.map((t) => t.id),
      studentIds: students.map((s) => s.id),
      lessonIds: lessons.map((l) => l.id),
    };
  } finally {
    await dataSource.destroy();
  }
}

run()
  .then((res) => {
    console.log(
      JSON.stringify(
        {
          success: true,
          counts: {
            teachers: res.teacherIds.length,
            students: res.studentIds.length,
            lessons: res.lessonIds.length,
          },
        },
        null,
        2,
      ),
    );
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });
