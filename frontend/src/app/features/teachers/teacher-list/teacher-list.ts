import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { TeachersService, Teacher, Student } from '../services/teachers.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';
import {
  TeacherStudentsDialog,
  TeacherStudentsDialogData,
} from '../teacher-students-dialog/teacher-students-dialog';

/**
 * TeacherList
 *
 * Displays all teachers in a Material table
 * Supports delete, view students, and navigation to form
 */
@Component({
  selector: 'app-teacher-list',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    LoadingSpinner,
  ],
  templateUrl: './teacher-list.html',
  styleUrl: './teacher-list.scss',
})
export class TeacherList implements OnInit {
  private readonly teachersService = inject(TeachersService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  teachers = signal<Teacher[]>([]);
  isLoading = signal<boolean>(true);
  displayedColumns = ['name', 'instrument', 'experience', 'studentsCount', 'actions'];

  ngOnInit(): void {
    this.loadTeachers();
  }

  loadTeachers(): void {
    this.isLoading.set(true);
    this.teachersService.getAllTeachers().subscribe({
      next: (teachers) => {
        this.teachers.set(teachers);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading teachers:', error);
        this.snackBar.open('Failed to load teachers', 'Close', {
          duration: 3000,
        });
        this.isLoading.set(false);
      },
    });
  }

  onCreateTeacher(): void {
    this.router.navigate(['/teachers/new']);
  }

  onEditTeacher(teacher: Teacher): void {
    this.router.navigate(['/teachers/edit', teacher.id]);
  }

  onViewStudents(teacher: Teacher): void {
    this.teachersService.getStudentsByTeacher(teacher.id).subscribe({
      next: (students: Student[]) => {
        const dialogData: TeacherStudentsDialogData = {
          teacherName: `${teacher.firstName} ${teacher.lastName}`,
          students,
        };

        this.dialog.open(TeacherStudentsDialog, {
          width: '600px',
          data: dialogData,
        });
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.snackBar.open('Failed to load students', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  onDeleteTeacher(teacher: Teacher): void {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Teacher',
      message: `Are you sure you want to delete ${teacher.firstName} ${teacher.lastName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.teachersService.deleteTeacher(teacher.id).subscribe({
          next: () => {
            this.snackBar.open('Teacher deleted successfully', 'Close', {
              duration: 3000,
            });
            this.loadTeachers();
          },
          error: (error) => {
            console.error('Error deleting teacher:', error);
            this.snackBar.open('Failed to delete teacher', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  getFullName(teacher: Teacher): string {
    return `${teacher.firstName} ${teacher.lastName}`;
  }

  getStudentCount(students: Student[]): number {
    return students?.length || 0;
  }
}
