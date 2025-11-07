import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe, NgClass } from '@angular/common';
import { Lesson, LessonStatus } from '../services/lessons.service';

@Component({
  selector: 'app-lesson-card',
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, DatePipe, NgClass],
  templateUrl: './lesson-card.html',
  styleUrl: './lesson-card.scss',
})
export class LessonCard {
  lesson = input.required<Lesson>();

  confirm = output<string>();
  reject = output<string>();
  complete = output<string>();
  cancel = output<string>();
  delete = output<string>();

  readonly LessonStatus = LessonStatus;

  onConfirm(): void {
    this.confirm.emit(this.lesson().id);
  }

  onReject(): void {
    this.reject.emit(this.lesson().id);
  }

  onComplete(): void {
    this.complete.emit(this.lesson().id);
  }

  onCancel(): void {
    this.cancel.emit(this.lesson().id);
  }

  onDelete(): void {
    this.delete.emit(this.lesson().id);
  }

  getStatusClass(status: LessonStatus): string {
    return `status-${status}`;
  }

  getTeacherName(): string {
    const teacher = this.lesson().teacher;
    return teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown';
  }

  getStudentName(): string {
    const student = this.lesson().student;
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
  }

  getDuration(): string {
    const start = new Date(this.lesson().startTime);
    const end = new Date(this.lesson().endTime);
    const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));

    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  }

  canConfirm(): boolean {
    return this.lesson().status === LessonStatus.PENDING;
  }

  canReject(): boolean {
    return this.lesson().status === LessonStatus.PENDING;
  }

  canComplete(): boolean {
    return this.lesson().status === LessonStatus.CONFIRMED && this.isPast();
  }

  canCancel(): boolean {
    return (
      this.lesson().status === LessonStatus.CONFIRMED ||
      this.lesson().status === LessonStatus.PENDING
    );
  }

  private isPast(): boolean {
    return new Date(this.lesson().endTime) < new Date();
  }
}
