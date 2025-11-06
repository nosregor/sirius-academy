import { expect, Page, Locator } from '@playwright/test';

export class StudentPortalPage {
  private readonly page: Page;
  private readonly title: Locator;
  private readonly table: Locator;
  private readonly createButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.title = page
      .getByRole('heading', { name: /students/i })
      .or(page.locator('mat-card-title:has-text("Students")'))
      .or(page.getByText('Students'));
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', {
      name: /new student|create student|add student/i,
    });
  }

  async goto(): Promise<void> {
    await this.page.goto('/students');
    await expect(this.page).toHaveURL(/\/students$/);
  }

  async assertLoaded(): Promise<void> {
    await expect(this.table).toBeVisible();
  }
}
