/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
import 'reflect-metadata';
import { dataSource } from '../../config/database.config';
import { Teacher } from '../../entities/teacher.entity';
import { Student } from '../../entities/student.entity';
import { Lesson, LessonStatus } from '../../entities/lesson.entity';
import { Instrument } from '../../entities/instrument.enum';

let faker: any;

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

async function clearTables(): Promise<void> {
  const runner = dataSource.createQueryRunner();
  await runner.connect();
  try {
    await runner.startTransaction();
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
  const allInstruments = Object.values(Instrument);
  const teacherRepo = dataSource.getRepository(Teacher);
  const teachers: Teacher[] = [];

  for (let i = 0; i < count; i++) {
    const t = teacherRepo.create({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password({ length: 12, memorable: false }),
      role: 'teacher',
      instrument: pickOne(allInstruments),
      experience: getRandomInt(1, 30),
    } as Teacher);
    teachers.push(t);
  }
  return teacherRepo.save(teachers);
}

async function seedStudents(count: number): Promise<Student[]> {
  const allInstruments = Object.values(Instrument);
  const studentRepo = dataSource.getRepository(Student);
  const students: Student[] = [];

  for (let i = 0; i < count; i++) {
    const s = studentRepo.create({
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      password: faker.internet.password({ length: 12, memorable: false }),
      role: 'student',
      instrument: pickOne(allInstruments),
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
    const numTeachers = faker.helpers.weightedArrayElement([
      { weight: 5, value: 1 },
      { weight: 3, value: 2 },
      { weight: 2, value: 3 },
    ]);

    const matchingTeachers = teachers.filter(
      (t) => t.instrument === student.instrument,
    );
    const otherTeachers = teachers.filter(
      (t) => t.instrument !== student.instrument,
    );

    const selectedTeachers: Teacher[] = [];

    if (matchingTeachers.length > 0 && numTeachers > 0) {
      selectedTeachers.push(pickOne(matchingTeachers));
    }

    const remainingSlots = numTeachers - selectedTeachers.length;
    const availableTeachers = [
      ...matchingTeachers.filter((t) => !selectedTeachers.includes(t)),
      ...otherTeachers,
    ];
    const shuffled = [...availableTeachers].sort(() => Math.random() - 0.5);
    selectedTeachers.push(...shuffled.slice(0, remainingSlots));

    student.teachers = selectedTeachers;
    await studentRepo.save(student);
  }
}

function generateLessonWindows(): Array<{ start: Date; end: Date }> {
  const windows: Array<{ start: Date; end: Date }> = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let d = 0; d < 30; d++) {
    const dayDate = new Date(base);
    dayDate.setDate(base.getDate() + d);

    const dayOfWeek = dayDate.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const numLessons = getRandomInt(2, 5);
    const startHour = 9;
    const endHour = 19;
    const availableHours = endHour - startHour;

    for (let i = 0; i < numLessons; i++) {
      const hour = startHour + getRandomInt(0, availableHours - 1);
      const minute = pickOne([0, 15, 30, 45] as const);
      const start = new Date(dayDate);
      start.setHours(hour, minute, 0, 0);

      const durationOptions = [30, 45, 60, 90, 120] as const;
      const duration = pickOne(durationOptions);
      const end = addMinutes(start, duration);

      if (end.getHours() <= 19) {
        windows.push({ start, end });
      }
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
  const usedWindows = new Set<number>();

  for (let i = 0; i < targetCount && i < windows.length; i++) {
    const teacher = pickOne(teachers);
    const student = pickOne(students);

    if (
      !student.teachers ||
      !student.teachers.some((t) => t.id === teacher.id)
    ) {
      const studentRepo = dataSource.getRepository(Student);
      if (!student.teachers) {
        student.teachers = [];
      }
      student.teachers.push(teacher);
      await studentRepo.save(student);
    }

    let windowIndex: number;
    do {
      windowIndex = getRandomInt(0, windows.length - 1);
    } while (usedWindows.has(windowIndex) && usedWindows.size < windows.length);

    usedWindows.add(windowIndex);
    const w = windows[windowIndex]!;
    const { start, end } = w;

    const now = new Date();
    let status: LessonStatus;

    if (end < now) {
      status = faker.helpers.weightedArrayElement([
        { weight: 8, value: LessonStatus.COMPLETED },
        { weight: 2, value: LessonStatus.CANCELLED },
      ]);
    } else if (start < now) {
      status = LessonStatus.CONFIRMED;
    } else {
      status = faker.helpers.weightedArrayElement([
        { weight: 3, value: LessonStatus.PENDING },
        { weight: 7, value: LessonStatus.CONFIRMED },
      ]);
    }

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

async function runSeed(): Promise<SeedResult> {
  const fakerModule = await import('@faker-js/faker');
  faker = fakerModule.faker;
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

runSeed()
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
