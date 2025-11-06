import { test, expect } from '@playwright/test';

test.describe('Lessons', () => {
  test('should load lessons list and show filters', async ({ page }) => {
    await page.goto('/lessons');
    await expect(page.getByText('Lessons Management')).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Status' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Teacher' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Student' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Date' })).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Sort By' })).toBeVisible();
  });

  test('should switch to table view', async ({ page }) => {
    await page.goto('/lessons');
    const tableToggle = page
      .getByRole('button', { name: /table/i })
      .or(page.getByRole('radio', { name: /table/i }));
    await expect(tableToggle).toBeVisible();
    await tableToggle.click();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should create a new lesson end-to-end', async ({ page }) => {
    await page.goto('/lessons');
    await page.getByRole('button', { name: /new lesson/i }).click();
    await expect(
      page
        .getByRole('heading', { name: /new lesson/i })
        .or(page.locator('mat-card-title:has-text("New Lesson")')),
    ).toBeVisible();

    // Mock backend create and list to avoid dependency on API
    const createdId = crypto.randomUUID();
    await page.route('**/api/v1/lessons', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: createdId }),
        });
      } else if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        });
      } else {
        await route.continue();
      }
    });

    // Select teacher
    await page.getByRole('combobox', { name: 'Teacher' }).click();
    const teacherOptions = page.getByRole('option');
    const teacherCount = await teacherOptions.count();
    if (teacherCount === 0) {
      test.skip(true, 'No teachers available to create a lesson');
    }
    await teacherOptions.first().click();

    // Select student (filtered by teacher)
    await page.getByRole('combobox', { name: 'Student' }).click();
    const studentOptions = page.getByRole('option');
    const studentCount = await studentOptions.count();
    if (studentCount === 0) {
      test.skip(true, 'No students assigned to selected teacher');
    }
    await studentOptions.first().click();

    // Pick tomorrow from datepicker
    // Prefer filling the date directly to avoid datepicker flakiness
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    const yyyy = String(tomorrow.getFullYear());
    const formatted = `${mm}/${dd}/${yyyy}`;
    await page.getByRole('textbox', { name: 'Date' }).fill(formatted);

    // Select time
    await page.getByRole('combobox', { name: 'Hour' }).click();
    await page.getByRole('option').first().click();
    await page.getByRole('combobox', { name: 'Minute' }).click();
    await page.getByRole('option').first().click();

    // Duration
    await page.getByRole('spinbutton', { name: 'Duration (minutes)' }).fill('30');

    // Creator role
    await page.getByRole('combobox', { name: 'Creator Role' }).click();
    await page.getByRole('option').first().click();

    // Submit
    await page.getByRole('button', { name: /create lesson/i }).click();

    // Assert we returned to list and page shows Lessons Management
    await expect(page).toHaveURL(/\/lessons$/);
    await expect(page.getByText('Lessons Management')).toBeVisible();
  });
});
