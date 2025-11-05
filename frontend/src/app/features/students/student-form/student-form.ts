import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsService } from '../services/students.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

/**
 * StudentForm
 *
 * Form component for creating and editing students
 * Supports validation with inline error messages
 */
@Component({
  selector: 'app-student-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    LoadingSpinner,
  ],
  templateUrl: './student-form.html',
  styleUrl: './student-form.scss',
})
export class StudentForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly studentsService = inject(StudentsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  studentForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  studentId: string | null = null;

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  private initializeForm(): void {
    this.studentForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/),
        ],
      ],
      instrument: ['', Validators.required],
    });
  }

  private checkEditMode(): void {
    this.studentId = this.route.snapshot.paramMap.get('id');
    if (this.studentId) {
      this.isEditMode.set(true);
      this.loadStudent(this.studentId);
      // Password not required for edit
      this.studentForm.get('password')?.clearValidators();
      this.studentForm.get('password')?.updateValueAndValidity();
    }
  }

  private loadStudent(id: string): void {
    this.isLoading.set(true);
    this.studentsService.getStudentById(id).subscribe({
      next: (student) => {
        this.studentForm.patchValue({
          firstName: student.firstName,
          lastName: student.lastName,
          instrument: student.instrument,
        });
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading student:', error);
        this.snackBar.open('Failed to load student', 'Close', {
          duration: 3000,
        });
        this.isLoading.set(false);
        this.router.navigate(['/students']);
      },
    });
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    const formValue = this.studentForm.value;

    // Remove empty password field in edit mode
    if (this.isEditMode() && !formValue.password) {
      delete formValue.password;
    }

    const operation = this.isEditMode()
      ? this.studentsService.updateStudent(this.studentId!, formValue)
      : this.studentsService.createStudent(formValue);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode()
          ? 'Student updated successfully'
          : 'Student created successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.router.navigate(['/students']);
      },
      error: (error) => {
        console.error('Error saving student:', error);
        this.snackBar.open('Failed to save student', 'Close', {
          duration: 3000,
        });
        this.isSaving.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/students']);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.studentForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return 'This field is required';
    }
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    if (field.errors['pattern'] && fieldName === 'password') {
      return 'Password must contain uppercase, lowercase, and number';
    }
    return '';
  }
}
