import { expect, Page, Locator } from '@playwright/test';

export class TeacherDashboardPage {
  private readonly page: Page;
  private readonly navTeachers: Locator;
  private readonly title: Locator;
  private readonly table: Locator;
  private readonly createButton: Locator;
  private readonly viewStudentsButtons: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navTeachers = page.getByRole('link', { name: 'Teachers' });
    this.title = page
      .getByRole('heading', { name: /teachers/i })
      .or(page.locator('mat-card-title:has-text("Teachers")'))
      .or(page.getByText('Teachers'));
    this.table = page.locator('table');
    this.createButton = page.getByRole('button', {
      name: /new teacher|create teacher|add teacher/i,
    });
    this.viewStudentsButtons = page.getByRole('button', { name: /students|view students/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/teachers');
    await expect(this.page).toHaveURL(/\/teachers$/);
  }

  async assertLoaded(): Promise<void> {
    await expect(this.table).toBeVisible();
  }

  async openStudentsDialogForFirstRow(): Promise<void> {
    const btn = this.viewStudentsButtons.first();
    if (await btn.isVisible()) {
      await btn.click();
      await expect(this.page.getByRole('heading', { name: /students of/i })).toBeVisible();
      await this.page.getByRole('button', { name: /done|close/i }).click();
    }
  }
}
