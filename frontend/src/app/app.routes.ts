import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'teachers',
    pathMatch: 'full',
  },
  {
    path: 'teachers',
    loadComponent: () =>
      import('./features/teachers/teacher-list/teacher-list').then((m) => m.TeacherList),
  },
  {
    path: 'teachers/new',
    loadComponent: () =>
      import('./features/teachers/teacher-form/teacher-form').then((m) => m.TeacherForm),
  },
  {
    path: 'teachers/edit/:id',
    loadComponent: () =>
      import('./features/teachers/teacher-form/teacher-form').then((m) => m.TeacherForm),
  },
  {
    path: 'students',
    loadComponent: () =>
      import('./features/students/student-list/student-list').then((m) => m.StudentList),
  },
  {
    path: 'students/new',
    loadComponent: () =>
      import('./features/students/student-form/student-form').then((m) => m.StudentForm),
  },
  {
    path: 'students/edit/:id',
    loadComponent: () =>
      import('./features/students/student-form/student-form').then((m) => m.StudentForm),
  },
  {
    path: 'lessons',
    loadComponent: () =>
      import('./features/lessons/lesson-list/lesson-list').then((m) => m.LessonList),
  },
  {
    path: 'lessons/new',
    loadComponent: () =>
      import('./features/lessons/lesson-form/lesson-form').then((m) => m.LessonForm),
  },
  {
    path: '**',
    redirectTo: 'teachers',
  },
];
