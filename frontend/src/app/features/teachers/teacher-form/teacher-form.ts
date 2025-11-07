import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { TeachersService } from '../services/teachers.service';
import { LoadingSpinner } from '../../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-teacher-form',
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
  templateUrl: './teacher-form.html',
  styleUrl: './teacher-form.scss',
})
export class TeacherForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly teachersService = inject(TeachersService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly snackBar = inject(MatSnackBar);

  teacherForm!: FormGroup;
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  isSaving = signal<boolean>(false);
  teacherId: string | null = null;
  private originalValues: Record<string, any> | null = null;

  readonly instrumentOptions = ['Piano', 'Guitar', 'Bass', 'Drums', 'Voice', 'Ukulele'];

  ngOnInit(): void {
    this.initializeForm();
    this.checkEditMode();
  }

  private initializeForm(): void {
    this.teacherForm = this.fb.group({
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
      experience: [0, [Validators.required, Validators.min(0)]],
    });
  }

  private checkEditMode(): void {
    this.teacherId = this.route.snapshot.paramMap.get('id');
    if (this.teacherId) {
      this.isEditMode.set(true);
      this.loadTeacher(this.teacherId);
      this.teacherForm.get('password')?.clearValidators();
      this.teacherForm.get('password')?.updateValueAndValidity();
    }
  }

  private loadTeacher(id: string): void {
    this.isLoading.set(true);
    this.teachersService.getTeacherById(id).subscribe({
      next: (teacher) => {
        const formData = {
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          instrument: teacher.instrument,
          experience: teacher.experience,
          password: '',
        };
        this.originalValues = { ...formData };
        this.teacherForm.patchValue(formData);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading teacher:', error);
        this.snackBar.open('Failed to load teacher', 'Close', {
          duration: 3000,
        });
        this.isLoading.set(false);
        this.router.navigate(['/teachers']);
      },
    });
  }

  hasChanges = computed(() => {
    if (!this.isEditMode() || !this.originalValues) {
      return true;
    }

    const currentValue = { ...this.teacherForm.value };
    if (!currentValue.password) {
      delete currentValue.password;
    }

    const original = { ...this.originalValues };
    delete original['password'];

    return JSON.stringify(currentValue) !== JSON.stringify(original);
  });

  onSubmit(): void {
    if (this.teacherForm.invalid) {
      this.teacherForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode() && !this.hasChanges()) {
      this.snackBar.open('No changes detected', 'Close', { duration: 2000 });
      return;
    }

    this.isSaving.set(true);
    const formValue = this.teacherForm.value;

    if (this.isEditMode() && !formValue.password) {
      delete formValue.password;
    }

    const operation = this.isEditMode()
      ? this.teachersService.updateTeacher(this.teacherId!, formValue)
      : this.teachersService.createTeacher(formValue);

    operation.subscribe({
      next: () => {
        const message = this.isEditMode()
          ? 'Teacher updated successfully'
          : 'Teacher created successfully';
        this.snackBar.open(message, 'Close', { duration: 3000 });
        this.router.navigate(['/teachers']);
      },
      error: (error) => {
        console.error('Error saving teacher:', error);
        this.snackBar.open('Failed to save teacher', 'Close', {
          duration: 3000,
        });
        this.isSaving.set(false);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(['/teachers']);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.teacherForm.get(fieldName);
    if (!field || !field.errors || !field.touched) {
      return '';
    }

    if (field.errors['required']) {
      return 'This field is required';
    }
    if (field.errors['email']) {
      return 'Please enter a valid email';
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
