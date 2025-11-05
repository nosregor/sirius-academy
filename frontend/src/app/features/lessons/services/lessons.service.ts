import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

export enum LessonStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed',
}

export interface Lesson {
  id: string;
  teacherId: string;
  studentId: string;
  startTime: string;
  endTime: string;
  status: LessonStatus;
  createdBy: 'teacher' | 'student';
  createdAt: string;
  updatedAt: string;
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
    instrument: string;
  };
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    instrument: string;
  };
}

export interface CreateLessonDto {
  teacherId: string;
  studentId: string;
  startTime: string;
  endTime: string;
  creatorRole: 'teacher' | 'student';
}

export interface UpdateLessonStatusDto {
  status: LessonStatus;
}

@Injectable({
  providedIn: 'root',
})
export class LessonsService {
  private readonly apiService = inject(ApiService);
  private readonly endpoint = 'lessons';

  getAllLessons(
    status?: LessonStatus,
    teacherId?: string,
    studentId?: string,
  ): Observable<Lesson[]> {
    let url = this.endpoint;
    const params: string[] = [];

    if (status) params.push(`status=${status}`);
    if (teacherId) params.push(`teacherId=${teacherId}`);
    if (studentId) params.push(`studentId=${studentId}`);

    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }

    return this.apiService.get<Lesson[]>(url);
  }

  getLessonById(id: string): Observable<Lesson> {
    return this.apiService.get<Lesson>(`${this.endpoint}/${id}`);
  }

  getLessonsByTeacher(teacherId: string): Observable<Lesson[]> {
    return this.apiService.get<Lesson[]>(`${this.endpoint}/teacher/${teacherId}`);
  }

  getLessonsByStudent(studentId: string): Observable<Lesson[]> {
    return this.apiService.get<Lesson[]>(`${this.endpoint}/student/${studentId}`);
  }

  createLesson(lesson: CreateLessonDto): Observable<Lesson> {
    return this.apiService.post<Lesson>(this.endpoint, lesson);
  }

  confirmLesson(id: string): Observable<Lesson> {
    return this.apiService.put<Lesson>(`${this.endpoint}/${id}/confirm`, {});
  }

  rejectLesson(id: string): Observable<Lesson> {
    return this.apiService.put<Lesson>(`${this.endpoint}/${id}/reject`, {});
  }

  completeLesson(id: string): Observable<Lesson> {
    return this.apiService.put<Lesson>(`${this.endpoint}/${id}/complete`, {});
  }

  cancelLesson(id: string): Observable<Lesson> {
    return this.apiService.put<Lesson>(`${this.endpoint}/${id}/cancel`, {});
  }

  updateLessonStatus(id: string, dto: UpdateLessonStatusDto): Observable<Lesson> {
    return this.apiService.put<Lesson>(`${this.endpoint}/${id}/status`, dto);
  }

  deleteLesson(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}
