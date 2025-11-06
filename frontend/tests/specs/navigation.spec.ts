import { test, expect } from '@playwright/test';

test.describe('Basic Navigation', () => {
  test('should navigate to teachers and return 200', async ({ page }) => {
    const response = await page.goto('/teachers');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('table').or(page.locator('table'))).toBeVisible();
  });

  test('should navigate to students and return 200', async ({ page }) => {
    const response = await page.goto('/students');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('table').or(page.locator('table'))).toBeVisible();
  });
});
