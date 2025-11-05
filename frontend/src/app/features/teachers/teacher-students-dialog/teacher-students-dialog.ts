import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { Student } from '../services/teachers.service';

export interface TeacherStudentsDialogData {
  teacherName: string;
  students: Student[];
}

@Component({
  selector: 'app-teacher-students-dialog',
  imports: [MatDialogModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './teacher-students-dialog.html',
  styleUrl: './teacher-students-dialog.scss',
})
export class TeacherStudentsDialog {
  readonly dialogRef = inject(MatDialogRef<TeacherStudentsDialog>);
  readonly data = inject<TeacherStudentsDialogData>(MAT_DIALOG_DATA);

  onClose(): void {
    this.dialogRef.close();
  }

  getStudentName(student: Student): string {
    return `${student.firstName} ${student.lastName}`;
  }
}
