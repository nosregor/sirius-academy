import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe, LowerCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { LessonsService, Lesson, LessonStatus } from '../services/lessons.service';
import { StudentsService, Student } from '../../students/services/students.service';
import { TeachersService, Teacher } from '../../teachers/services/teachers.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import { LessonCard } from '../lesson-card/lesson-card';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';

export interface GroupedLessons {
  date: string;
  displayDate: string;
  lessons: Lesson[];
}

@Component({
  selector: 'app-lesson-list',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule,
    MatButtonToggleModule,
    MatTableModule,
    MatTooltipModule,
    DatePipe,
    LowerCasePipe,
    LoadingSpinner,
    LessonCard,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './lesson-list.html',
  styleUrl: './lesson-list.scss',
})
export class LessonList implements OnInit {
  private readonly lessonsService = inject(LessonsService);
  private readonly studentsService = inject(StudentsService);
  private readonly teachersService = inject(TeachersService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  lessons = signal<Lesson[]>([]);
  groupedLessons = signal<GroupedLessons[]>([]);
  allLessons = signal<Lesson[]>([]);
  teachers = signal<Teacher[]>([]);
  students = signal<Student[]>([]);
  isLoading = signal<boolean>(true);

  selectedStatus = signal<LessonStatus | ''>('');
  selectedTeacher = signal<string>('');
  selectedStudent = signal<string>('');
  selectedDate = signal<Date | null>(null);
  selectedSort = signal<string>('date-desc');
  viewMode = signal<'cards' | 'table'>('cards');

  readonly displayedColumns = [
    'date',
    'teacher',
    'student',
    'duration',
    'status',
    'createdBy',
    'actions',
  ];

  readonly statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: LessonStatus.PENDING, label: 'Pending' },
    { value: LessonStatus.CONFIRMED, label: 'Confirmed' },
    { value: LessonStatus.CANCELLED, label: 'Cancelled' },
    { value: LessonStatus.COMPLETED, label: 'Completed' },
  ];

  readonly sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'teacher', label: 'Teacher Name' },
    { value: 'student', label: 'Student Name' },
    { value: 'status', label: 'Status' },
  ];

  ngOnInit(): void {
    this.loadFilters();
    this.loadLessons();
  }

  private loadFilters(): void {
    this.teachersService.getAllTeachers().subscribe({
      next: (teachers) => this.teachers.set(teachers),
      error: (error) => console.error('Error loading teachers:', error),
    });

    this.studentsService.getAllStudents().subscribe({
      next: (students) => this.students.set(students),
      error: (error) => console.error('Error loading students:', error),
    });
  }

  loadLessons(): void {
    this.isLoading.set(true);
    const status = this.selectedStatus() || undefined;
    const teacherId = this.selectedTeacher() || undefined;
    const studentId = this.selectedStudent() || undefined;

    this.lessonsService.getAllLessons(status as LessonStatus, teacherId, studentId).subscribe({
      next: (lessons) => {
        this.allLessons.set(lessons);

        let filteredLessons = lessons;

        const selectedDate = this.selectedDate();
        if (selectedDate) {
          const dateStr = selectedDate.toISOString().split('T')[0];
          filteredLessons = lessons.filter((lesson) => {
            const lessonDate = new Date(lesson.startTime).toISOString().split('T')[0];
            return lessonDate === dateStr;
          });
        }

        filteredLessons = this.sortLessons(filteredLessons);

        this.lessons.set(filteredLessons);

        this.groupedLessons.set(this.groupLessonsByDate(filteredLessons));

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading lessons:', error);
        this.snackBar.open('Failed to load lessons', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  onStatusChange(value: LessonStatus | ''): void {
    this.selectedStatus.set(value);
    this.loadLessons();
  }

  onTeacherChange(value: string): void {
    this.selectedTeacher.set(value);
    this.loadLessons();
  }

  onStudentChange(value: string): void {
    this.selectedStudent.set(value);
    this.loadLessons();
  }

  onDateChange(date: Date | null): void {
    this.selectedDate.set(date);
    this.loadLessons();
  }

  clearDateFilter(): void {
    this.selectedDate.set(null);
    this.loadLessons();
  }

  onSortSelectChange(value: string): void {
    this.selectedSort.set(value);
    this.loadLessons();
  }

  onViewModeChange(mode: 'cards' | 'table'): void {
    this.viewMode.set(mode);
  }

  getLessonDuration(lesson: Lesson): string {
    const start = new Date(lesson.startTime);
    const end = new Date(lesson.endTime);
    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    if (minutes < 60) {
      return `${minutes}min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }

  private sortLessons(lessons: Lesson[]): Lesson[] {
    const sortValue = this.selectedSort();
    const sorted = [...lessons];

    switch (sortValue) {
      case 'date-desc':
        return sorted.sort(
          (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
        );
      case 'date-asc':
        return sorted.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        );
      case 'teacher':
        return sorted.sort((a, b) => {
          const teacherA = this.getTeacherName(a.teacherId).toLowerCase();
          const teacherB = this.getTeacherName(b.teacherId).toLowerCase();
          return teacherA.localeCompare(teacherB);
        });
      case 'student':
        return sorted.sort((a, b) => {
          const studentA = this.getStudentName(a.studentId).toLowerCase();
          const studentB = this.getStudentName(b.studentId).toLowerCase();
          return studentA.localeCompare(studentB);
        });
      case 'status':
        return sorted.sort((a, b) => a.status.localeCompare(b.status));
      default:
        return sorted;
    }
  }

  private groupLessonsByDate(lessons: Lesson[]): GroupedLessons[] {
    const groups = new Map<string, Lesson[]>();

    lessons.forEach((lesson) => {
      const date = new Date(lesson.startTime).toISOString().split('T')[0];
      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(lesson);
    });

    const result: GroupedLessons[] = [];
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    groups.forEach((lessons, date) => {
      let displayDate = date;
      if (date === today) {
        displayDate = `Today - ${date}`;
      } else if (date === tomorrow) {
        displayDate = `Tomorrow - ${date}`;
      } else {
        const dateObj = new Date(date);
        const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
        displayDate = `${dayName} - ${date}`;
      }

      result.push({
        date,
        displayDate,
        lessons,
      });
    });

    const futureAndToday: GroupedLessons[] = [];
    const past: GroupedLessons[] = [];

    result.forEach((group) => {
      if (group.date >= today) {
        futureAndToday.push(group);
      } else {
        past.push(group);
      }
    });

    futureAndToday.sort((a, b) => a.date.localeCompare(b.date));
    past.sort((a, b) => b.date.localeCompare(a.date));

    return [...futureAndToday, ...past];
  }

  onCreateLesson(): void {
    this.router.navigate(['/lessons/new']);
  }

  onConfirm(lessonId: string): void {
    this.lessonsService.confirmLesson(lessonId).subscribe({
      next: () => {
        this.snackBar.open('Lesson confirmed', 'Close', { duration: 2000 });
        this.loadLessons();
      },
      error: (error) => {
        console.error('Error confirming lesson:', error);
        this.snackBar.open('Failed to confirm lesson', 'Close', { duration: 3000 });
      },
    });
  }

  onReject(lessonId: string): void {
    this.lessonsService.rejectLesson(lessonId).subscribe({
      next: () => {
        this.snackBar.open('Lesson rejected', 'Close', { duration: 2000 });
        this.loadLessons();
      },
      error: (error) => {
        console.error('Error rejecting lesson:', error);
        this.snackBar.open('Failed to reject lesson', 'Close', { duration: 3000 });
      },
    });
  }

  onComplete(lessonId: string): void {
    this.lessonsService.completeLesson(lessonId).subscribe({
      next: () => {
        this.snackBar.open('Lesson completed', 'Close', { duration: 2000 });
        this.loadLessons();
      },
      error: (error) => {
        console.error('Error completing lesson:', error);
        this.snackBar.open('Failed to complete lesson', 'Close', { duration: 3000 });
      },
    });
  }

  onCancel(lessonId: string): void {
    this.lessonsService.cancelLesson(lessonId).subscribe({
      next: () => {
        this.snackBar.open('Lesson cancelled', 'Close', { duration: 2000 });
        this.loadLessons();
      },
      error: (error) => {
        console.error('Error cancelling lesson:', error);
        this.snackBar.open('Failed to cancel lesson', 'Close', { duration: 3000 });
      },
    });
  }

  onDelete(lessonId: string): void {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Lesson',
      message: 'Are you sure you want to delete this lesson? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.lessonsService.deleteLesson(lessonId).subscribe({
          next: () => {
            this.snackBar.open('Lesson deleted successfully', 'Close', { duration: 3000 });
            this.loadLessons();
          },
          error: (error) => {
            console.error('Error deleting lesson:', error);
            this.snackBar.open('Failed to delete lesson', 'Close', { duration: 3000 });
          },
        });
      }
    });
  }

  getTeacherName(teacherId: string): string {
    const teacher = this.teachers().find((t) => t.id === teacherId);
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : '';
  }

  getStudentName(studentId: string): string {
    const student = this.students().find((s) => s.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : '';
  }

  getStatCount(status: string): number {
    if (status === 'total') {
      return this.allLessons().length;
    }
    return this.allLessons().filter((lesson) => lesson.status === status).length;
  }
}
