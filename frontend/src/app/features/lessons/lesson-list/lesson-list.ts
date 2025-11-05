import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
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

/**
 * LessonList
 *
 * Displays all lessons with filtering options
 * Supports status management and deletion
 */
@Component({
  selector: 'app-lesson-list',
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDialogModule,
    MatSnackBarModule,
    LoadingSpinner,
    LessonCard,
  ],
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
  teachers = signal<Teacher[]>([]);
  students = signal<Student[]>([]);
  isLoading = signal<boolean>(true);

  selectedStatus = signal<LessonStatus | ''>('');
  selectedTeacher = signal<string>('');
  selectedStudent = signal<string>('');

  readonly statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: LessonStatus.PENDING, label: 'Pending' },
    { value: LessonStatus.CONFIRMED, label: 'Confirmed' },
    { value: LessonStatus.CANCELLED, label: 'Cancelled' },
    { value: LessonStatus.COMPLETED, label: 'Completed' },
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
        this.lessons.set(lessons);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading lessons:', error);
        this.snackBar.open('Failed to load lessons', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  onFilterChange(): void {
    this.loadLessons();
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
}
