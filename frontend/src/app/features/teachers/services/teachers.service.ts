import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  instrument: string;
  experience: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherDto {
  firstName: string;
  lastName: string;
  password: string;
  instrument: string;
  experience: number;
}

export interface UpdateTeacherDto {
  firstName?: string;
  lastName?: string;
  password?: string;
  instrument?: string;
  experience?: number;
}

export interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * TeachersService
 *
 * Service for managing teacher-related operations
 * Provides CRUD operations and student relationship management
 */
@Injectable({
  providedIn: 'root',
})
export class TeachersService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'teachers';

  getAllTeachers(): Observable<Teacher[]> {
    return this.apiService.get<Teacher[]>(this.endpoint);
  }

  getTeacherById(id: string): Observable<Teacher> {
    return this.apiService.get<Teacher>(`${this.endpoint}/${id}`);
  }

  createTeacher(teacher: CreateTeacherDto): Observable<Teacher> {
    return this.apiService.post<Teacher>(this.endpoint, teacher);
  }

  updateTeacher(id: string, teacher: UpdateTeacherDto): Observable<Teacher> {
    return this.apiService.put<Teacher>(`${this.endpoint}/${id}`, teacher);
  }

  deleteTeacher(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }

  getStudentsByTeacher(teacherId: string): Observable<Student[]> {
    return this.apiService.get<Student[]>(`${this.endpoint}/${teacherId}/students`);
  }
}
