import { test, expect } from '@playwright/test';
import { StudentPortalPage } from '../pages/student-portal.page';

test.describe('Create Student (Prompt Data)', () => {
  test('should create a student with provided test data', async ({ page }) => {
    const students = new StudentPortalPage(page);
    await students.goto();
    await students.assertLoaded();

    // Open creation form
    await page.getByRole('button', { name: /new student|create student|add student/i }).click();
    await expect(
      page
        .getByRole('heading', { name: /new student/i })
        .or(page.locator('mat-card-title:has-text("New Student")')),
    ).toBeVisible();

    // Test data from prompt
    const firstName = 'Test';
    const lastName = 'User';
    const password = 'Q1W*1#$qw1qe2rg1';
    const instrument = 'Piano';

    // Network mocking for deterministic behavior
    const createdId = '00000000-0000-0000-0000-000000000001';
    await page.route('**/api/v1/students**', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: createdId, firstName, lastName, instrument }),
        });
        return;
      }
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([{ id: createdId, firstName, lastName, instrument, teachers: [] }]),
        });
        return;
      }
      await route.continue();
    });

    // Fill form
    await page.getByRole('textbox', { name: /first name/i }).fill(firstName);
    await page.getByRole('textbox', { name: /last name/i }).fill(lastName);
    await page.getByRole('textbox', { name: /password/i }).fill(password);

    await page.getByRole('combobox', { name: /instrument/i }).click();
    const exactOption = page.getByRole('option', { name: new RegExp(`^${instrument}$`, 'i') });
    if (await exactOption.count()) {
      await exactOption.first().click();
    } else {
      await page.getByRole('option').first().click();
    }

    // Submit
    await page.getByRole('button', { name: /create|save/i }).click();

    // Wait for navigation/list reload and verify Students page heading instead of table role
    await page.waitForLoadState('networkidle');
    await expect(
      page
        .getByRole('heading', { name: /students/i })
        .or(page.locator('mat-card-title:has-text("Students")'))
        .or(page.getByText('Students')),
    ).toBeVisible({ timeout: 15000 });

    // Assert list shows newly created student
    await expect(page.getByText(`${firstName} ${lastName}`)).toBeVisible({ timeout: 15000 });
  });
});
