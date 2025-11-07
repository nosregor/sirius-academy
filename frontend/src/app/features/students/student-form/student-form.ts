import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsService } from '../services/students.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-student-form',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
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
  private originalValues: Record<string, any> | null = null;

  readonly instrumentOptions = ['Piano', 'Guitar', 'Bass', 'Drums', 'Voice', 'Ukulele'];

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
          Validators.maxLength(64),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/),
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
      this.studentForm.get('password')?.clearValidators();
      this.studentForm.get('password')?.updateValueAndValidity();
    }
  }

  private loadStudent(id: string): void {
    this.isLoading.set(true);
    this.studentsService.getStudentById(id).subscribe({
      next: (student) => {
        const formData = {
          firstName: student.firstName,
          lastName: student.lastName,
          instrument: student.instrument,
          password: '',
        };
        this.originalValues = {
          firstName: student.firstName,
          lastName: student.lastName,
          instrument: student.instrument,
        };
        this.studentForm.patchValue(formData);
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

  hasChanges(): boolean {
    if (!this.isEditMode() || !this.originalValues) {
      return true;
    }

    const currentValue = {
      firstName: this.studentForm.value.firstName,
      lastName: this.studentForm.value.lastName,
      instrument: this.studentForm.value.instrument,
    };

    return JSON.stringify(currentValue) !== JSON.stringify(this.originalValues);
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      this.studentForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode() && !this.hasChanges()) {
      this.snackBar.open('No changes detected', 'Close', { duration: 2000 });
      return;
    }

    this.isSaving.set(true);
    const formValue = this.studentForm.value;

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
      return 'Password must contain uppercase, lowercase, number, and only allowed special characters (@$!%*?&)';
    }
    if (field.errors['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    return '';
  }
}
