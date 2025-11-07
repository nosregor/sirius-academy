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
  allStudents = signal<Student[]>([]);
  filteredStudents = signal<Student[]>([]);
  isLoading = signal<boolean>(true);
  isSaving = signal<boolean>(false);
  selectedTeacherId = signal<string>('');

  readonly initialStatusOptions = [
    { value: 'teacher', label: 'Confirmed', hint: 'Lesson will be created as confirmed' },
    {
      value: 'student',
      label: 'Pending Request',
      hint: 'Lesson will be created as pending (requires confirmation)',
    },
  ];

  readonly minDate = new Date();

  readonly hourOptions = Array.from({ length: 24 }, (_, i) => ({
    value: i,
    label: i.toString().padStart(2, '0'),
  }));

  readonly minuteOptions = [0, 15, 30, 45].map((value) => ({
    value,
    label: value.toString().padStart(2, '0'),
  }));

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  private initializeForm(): void {
    const now = new Date();
    let defaultHour = now.getHours();
    let defaultMinute = Math.ceil(now.getMinutes() / 15) * 15; // Round up to nearest 15 minutes

    if (defaultMinute >= 60) {
      defaultMinute = 0;
      defaultHour = (defaultHour + 1) % 24;
    }

    this.lessonForm = this.fb.group({
      teacherId: ['', Validators.required],
      studentId: ['', Validators.required],
      startDate: ['', Validators.required],
      startHour: [defaultHour, Validators.required],
      startMinute: [defaultMinute, Validators.required],
      duration: [60, [Validators.required, Validators.min(15), Validators.max(240)]],
      creatorRole: ['student', Validators.required],
    });

    this.lessonForm.get('startHour')?.valueChanges.subscribe(() => this.updateStartTime());
    this.lessonForm.get('startMinute')?.valueChanges.subscribe(() => this.updateStartTime());

    this.lessonForm.get('teacherId')?.valueChanges.subscribe((teacherId) => {
      this.selectedTeacherId.set(teacherId);
      if (teacherId) {
        this.filterStudentsByTeacher(teacherId);
      } else {
        this.filteredStudents.set(this.allStudents());
      }
      this.lessonForm.patchValue({ studentId: '' });
    });
  }

  private updateStartTime(): void {
    const hour = this.lessonForm.get('startHour')?.value ?? 0;
    const minute = this.lessonForm.get('startMinute')?.value ?? 0;
    const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    this.lessonForm.patchValue({ startTime: timeString }, { emitEvent: false });
  }

  private loadData(): void {
    this.isLoading.set(true);

    forkJoin({
      teachers: this.teachersService.getAllTeachers(),
      students: this.studentsService.getAllStudents(),
    }).subscribe({
      next: ({ teachers, students }) => {
        this.teachers.set(teachers);
        this.students.set(students);
        this.allStudents.set(students);
        this.filteredStudents.set(students);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.snackBar.open('Failed to load data', 'Close', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }

  private filterStudentsByTeacher(teacherId: string): void {
    this.teachersService.getStudentsByTeacher(teacherId).subscribe({
      next: (assignedStudents) => {
        this.filteredStudents.set(assignedStudents);

        if (assignedStudents.length === 0) {
          this.snackBar.open(
            'No students assigned to this teacher. Please assign students first in the Students section.',
            'Close',
            { duration: 4000 },
          );
        }
      },
      error: (error) => {
        console.error('Error loading teacher students:', error);
        this.filteredStudents.set([]);
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

    const timeString = `${formValue.startHour.toString().padStart(2, '0')}:${formValue.startMinute.toString().padStart(2, '0')}`;

    const startDateTime = this.combineDateAndTime(formValue.startDate, timeString);
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
        let errorMsg = 'Failed to create lesson';

        if (error.error?.message) {
          if (Array.isArray(error.error.message)) {
            errorMsg = error.error.message.join(', ');
          } else {
            errorMsg = error.error.message;
          }
        } else if (error.message) {
          errorMsg = error.message;
        }

        if (errorMsg.includes('Student must be assigned to teacher')) {
          errorMsg =
            'Cannot create lesson: Student must be assigned to this teacher first. Please assign the student in the Students section.';
        } else if (errorMsg.includes('conflicting lesson')) {
          errorMsg = 'Cannot create lesson: Time slot conflicts with an existing lesson.';
        } else if (errorMsg.includes('not found')) {
          errorMsg = 'Cannot create lesson: Teacher or student not found.';
        }

        this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
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
