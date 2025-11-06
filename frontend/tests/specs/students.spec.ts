import { test, expect } from '@playwright/test';
import { StudentPortalPage } from '../pages/student-portal.page';

test.describe('Students Portal', () => {
  test('should load students list', async ({ page }) => {
    const students = new StudentPortalPage(page);
    await students.goto();
    await students.assertLoaded();
  });

  test('should create a new student', async ({ page }) => {
    const students = new StudentPortalPage(page);
    await students.goto();
    await students.assertLoaded();

    // Open form
    await page.getByRole('button', { name: /new student/i }).click();
    await expect(
      page
        .getByRole('heading', { name: /new student/i })
        .or(page.locator('mat-card-title:has-text("New Student")')),
    ).toBeVisible();

    // Fill form - use unique name to assert later
    const first = `Auto${Date.now().toString().slice(-6)}`;
    const last = 'Student';
    await page.getByRole('textbox', { name: 'First Name' }).fill(first);
    await page.getByRole('textbox', { name: 'Last Name' }).fill(last);
    await page.getByRole('textbox', { name: 'Password' }).fill('StrongP@ssw0rd1');

    // Select instrument (first option)
    await page.getByRole('combobox', { name: 'Instrument' }).click();
    await page.getByRole('option').first().click();

    // Mock backend: POST create and subsequent GET list
    const createdId = crypto.randomUUID();
    await page.route('**/api/v1/students', async (route) => {
      const method = route.request().method();
      if (method === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: createdId,
            firstName: first,
            lastName: last,
            instrument: 'Piano',
          }),
        });
      } else if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([
            { id: createdId, firstName: first, lastName: last, instrument: 'Piano', teachers: [] },
          ]),
        });
      } else {
        await route.continue();
      }
    });

    // Submit
    await page.getByRole('button', { name: /create/i }).click();

    // Wait for list to render with mocked GET
    await expect(page.getByRole('table').or(page.locator('table'))).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(`${first} ${last}`)).toBeVisible();
  });
});
