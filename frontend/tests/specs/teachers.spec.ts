import { test, expect } from '@playwright/test';
import { TeacherDashboardPage } from '../pages/teacher-dashboard.page';

test.describe('Teachers Dashboard', () => {
  test('should load teachers list and open students dialog', async ({ page }) => {
    const teachers = new TeacherDashboardPage(page);
    await teachers.goto();
    await teachers.assertLoaded();
    await teachers.openStudentsDialogForFirstRow();
  });
});
