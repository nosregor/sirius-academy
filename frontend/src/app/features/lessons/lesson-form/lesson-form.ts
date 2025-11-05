import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { LessonsService } from '../services/lessons.service';
import { StudentsService, Student } from '../../students/services/students.service';
import { TeachersService, Teacher } from '../../teachers/services/teachers.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

/**
 * LessonForm
 *
 * Form component for creating lessons
 * Enforces 15-minute time slots and duration validation
 */
@Component({
  selector: 'app-lesson-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatDatepickerModule,
    MatNativeDateModule,
    LoadingSpinner,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './lesson-form.html',
  styleUrl: './lesson-form.scss',
})
export class LessonForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly lessonsService = inject(LessonsService);
  private readonly studentsService = inject(StudentsService);
  private readonly teachersService = inject(TeachersService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  lessonForm!: FormGroup;
  teachers = signal<Teacher[]>([]);
  students = signal<Student[]>([]);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);

  readonly creatorRoleOptions = [
    { value: 'teacher', label: 'Teacher (Confirmed)' },
    { value: 'student', label: 'Student (Pending)' },
  ];

  readonly minDate = new Date();

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  private initializeForm(): void {
    this.lessonForm = this.fb.group({
      teacherId: ['', Validators.required],
      studentId: ['', Validators.required],
      startDate: ['', Validators.required],
      startTime: ['', [Validators.required, this.timeSlotValidator]],
      duration: [60, [Validators.required, Validators.min(15), Validators.max(240)]],
      creatorRole: ['teacher', Validators.required],
    });
  }

  private loadData(): void {
    this.isLoading.set(true);

    // Load teachers and students using RxJS forkJoin
    forkJoin({
      teachers: this.teachersService.getAllTeachers(),
      students: this.studentsService.getAllStudents(),
    }).subscribe({
      next: ({ teachers, students }) => {
        this.teachers.set(teachers);
        this.students.set(students);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.snackBar.open('Failed to load data', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  private timeSlotValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;

    const [hours, minutes] = control.value.split(':').map(Number);
    if (minutes % 15 !== 0) {
      return { invalidTimeSlot: 'Time must be in 15-minute intervals' };
    }
    return null;
  }

  onSubmit(): void {
    if (this.lessonForm.invalid) {
      this.lessonForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.lessonForm.value;

    // Combine date and time
    const startDateTime = this.combineDateAndTime(formValue.startDate, formValue.startTime);
    const endDateTime = new Date(startDateTime.getTime() + formValue.duration * 60 * 1000);

    const createDto = {
      teacherId: formValue.teacherId,
      studentId: formValue.studentId,
      startTime: startDateTime.toISOString(),
      endTime: endDateTime.toISOString(),
      creatorRole: formValue.creatorRole,
    };

    this.lessonsService.createLesson(createDto).subscribe({
      next: () => {
        const statusMsg =
          formValue.creatorRole === 'teacher'
            ? 'Lesson created and confirmed'
            : 'Lesson request created (pending confirmation)';
        this.snackBar.open(statusMsg, 'Close', { duration: 3000 });
        this.router.navigate(['/lessons']);
      },
      error: (error) => {
        console.error('Error creating lesson:', error);
        const errorMsg = error.error?.message || 'Failed to create lesson';
        this.snackBar.open(errorMsg, 'Close', { duration: 4000 });
        this.isSaving.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/lessons']);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.lessonForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return 'This field is required';
    }
    if (field.errors['min']) {
      return `Minimum value is ${field.errors['min'].min}`;
    }
    if (field.errors['max']) {
      return `Maximum value is ${field.errors['max'].max}`;
    }
    if (field.errors['invalidTimeSlot']) {
      return field.errors['invalidTimeSlot'];
    }
    return '';
  }

  private combineDateAndTime(date: Date | string, timeStr: string): Date {
    const dateObj = date instanceof Date ? date : new Date(date);
    const [hours, minutes] = timeStr.split(':').map(Number);
    dateObj.setHours(hours, minutes, 0, 0);
    return dateObj;
  }
}
