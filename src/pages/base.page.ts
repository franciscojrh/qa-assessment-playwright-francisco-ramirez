import { type Page } from '@playwright/test';

/**
 * Abstract Base Page Object Model
 * Candidates must extend this class for all Page Object classes authored in src/pages/
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
}
