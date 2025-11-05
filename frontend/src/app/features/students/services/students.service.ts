import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  instrument: string;
  createdAt: string;
  updatedAt: string;
  teachers?: Teacher[];
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  instrument: string;
  experience: number;
}

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  password: string;
  instrument: string;
}

export interface UpdateStudentDto {
  firstName?: string;
  lastName?: string;
  password?: string;
  instrument?: string;
}

/**
 * StudentsService
 *
 * Service for managing student-related operations
 * Provides CRUD operations and teacher relationship management
 */
@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'students';

  getAllStudents(): Observable<Student[]> {
    return this.apiService.get<Student[]>(this.endpoint);
  }

  getStudentById(id: string): Observable<Student> {
    return this.apiService.get<Student>(`${this.endpoint}/${id}`);
  }

  createStudent(student: CreateStudentDto): Observable<Student> {
    return this.apiService.post<Student>(this.endpoint, student);
  }

  updateStudent(id: string, student: UpdateStudentDto): Observable<Student> {
    return this.apiService.put<Student>(`${this.endpoint}/${id}`, student);
  }

  deleteStudent(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  getTeachersByStudent(studentId: string): Observable<Teacher[]> {
    return this.apiService.get<Teacher[]>(`${this.endpoint}/${studentId}/teachers`);
  }

  assignTeacher(studentId: string, teacherId: string): Observable<void> {
    return this.apiService.post<void>(`${this.endpoint}/${studentId}/teachers/${teacherId}`, {});
  }

  unassignTeacher(studentId: string, teacherId: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${studentId}/teachers/${teacherId}`);
  }

  getAllTeachers(): Observable<Teacher[]> {
    return this.apiService.get<Teacher[]>('teachers');
  }
}

