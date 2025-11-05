import { Component, OnInit, inject, signal } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router } from '@angular/router';
import { StudentsService, Student } from '../services/students.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';
import {
  ConfirmDialog,
  ConfirmDialogData,
} from '../../../shared/components/confirm-dialog/confirm-dialog';
import { TeacherAssignment } from '../teacher-assignment/teacher-assignment';

/**
 * StudentList
 *
 * Displays all students in a Material table
 * Supports delete, manage teachers, and navigation to form
 */
@Component({
  selector: 'app-student-list',
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
  templateUrl: './student-list.html',
  styleUrl: './student-list.scss',
})
export class StudentList implements OnInit {
  private readonly studentsService = inject(StudentsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  students = signal<Student[]>([]);
  isLoading = signal<boolean>(true);
  displayedColumns = ['name', 'instrument', 'teacherCount', 'actions'];

  ngOnInit(): void {
    this.loadStudents();
  }

  loadStudents(): void {
    this.isLoading.set(true);
    this.studentsService.getAllStudents().subscribe({
      next: (students) => {
        this.students.set(students);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading students:', error);
        this.snackBar.open('Failed to load students', 'Close', {
          duration: 3000,
        });
        this.isLoading.set(false);
      },
    });
  }

  onCreateStudent(): void {
    this.router.navigate(['/students/new']);
  }

  onEditStudent(student: Student): void {
    this.router.navigate(['/students/edit', student.id]);
  }

  onManageTeachers(student: Student): void {
    const dialogRef = this.dialog.open(TeacherAssignment, {
      width: '600px',
      data: { student },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadStudents();
      }
    });
  }

  onDeleteStudent(student: Student): void {
    const dialogData: ConfirmDialogData = {
      title: 'Delete Student',
      message: `Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    };

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '400px',
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.studentsService.deleteStudent(student.id).subscribe({
          next: () => {
            this.snackBar.open('Student deleted successfully', 'Close', {
              duration: 3000,
            });
            this.loadStudents();
          },
          error: (error) => {
            console.error('Error deleting student:', error);
            this.snackBar.open('Failed to delete student', 'Close', {
              duration: 3000,
            });
          },
        });
      }
    });
  }

  getFullName(student: Student): string {
    return `${student.firstName} ${student.lastName}`;
  }

  getTeacherCount(student: Student): number {
    return student.teachers?.length || 0;
  }
}
