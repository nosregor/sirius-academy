import { Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';
import { StudentsService, Student, Teacher } from '../services/students.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

export interface TeacherAssignmentData {
  student: Student;
}

/**
 * TeacherAssignment
 *
 * Dialog component for managing student-teacher assignments
 * Allows assigning and unassigning teachers to/from a student
 */
@Component({
  selector: 'app-teacher-assignment',
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatChipsModule,
    MatSnackBarModule,
    LoadingSpinner,
  ],
  templateUrl: './teacher-assignment.html',
  styleUrl: './teacher-assignment.scss',
})
export class TeacherAssignment implements OnInit {
  readonly dialogRef = inject(MatDialogRef<TeacherAssignment>);
  readonly data = inject<TeacherAssignmentData>(MAT_DIALOG_DATA);
  private readonly studentsService = inject(StudentsService);
  private readonly snackBar = inject(MatSnackBar);

  assignedTeachers = signal<Teacher[]>([]);
  availableTeachers = signal<Teacher[]>([]);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.loadTeachers();
  }

  private loadTeachers(): void {
    this.isLoading.set(true);

    // Load both assigned and all teachers using RxJS forkJoin
    forkJoin({
      assigned: this.studentsService.getTeachersByStudent(this.data.student.id),
      all: this.studentsService.getAllTeachers(),
    }).subscribe({
      next: ({ assigned, all }) => {
        this.assignedTeachers.set(assigned);

        // Filter out already assigned teachers
        const assignedIds = new Set(assigned.map((t) => t.id));
        const available = all.filter((t) => !assignedIds.has(t.id));
        this.availableTeachers.set(available);

        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading teachers:', error);
        this.snackBar.open('Failed to load teachers', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  onAssignTeacher(teacher: Teacher): void {
    this.studentsService.assignTeacher(this.data.student.id, teacher.id).subscribe({
      next: () => {
        this.snackBar.open(`${teacher.firstName} ${teacher.lastName} assigned`, 'Close', {
          duration: 2000,
        });
        this.loadTeachers();
      },
      error: (error) => {
        console.error('Error assigning teacher:', error);
        this.snackBar.open('Failed to assign teacher', 'Close', { duration: 3000 });
      },
    });
  }

  onUnassignTeacher(teacher: Teacher): void {
    this.studentsService.unassignTeacher(this.data.student.id, teacher.id).subscribe({
      next: () => {
        this.snackBar.open(`${teacher.firstName} ${teacher.lastName} unassigned`, 'Close', {
          duration: 2000,
        });
        this.loadTeachers();
      },
      error: (error) => {
        console.error('Error unassigning teacher:', error);
        this.snackBar.open('Failed to unassign teacher', 'Close', { duration: 3000 });
      },
    });
  }

  onClose(): void {
    this.dialogRef.close(true);
  }

  getTeacherName(teacher: Teacher): string {
    return `${teacher.firstName} ${teacher.lastName}`;
  }
}
