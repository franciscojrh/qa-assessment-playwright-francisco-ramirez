import { type Page, type Locator, expect } from '@playwright/test';

import { BasePage } from './base.page';

/**
 * Example POM against https://playwright.dev (temporary smoke target).
 * Candidates should follow this pattern: private locators, public user actions.
 */
export class ExamplePage extends BasePage {
  private readonly getStartedLink: Locator;
  private readonly docsNav: Locator;

  constructor(page: Page) {
    super(page);
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
    this.docsNav = page.getByRole('link', { name: 'Docs' }).first();
  }

  async openHome(): Promise<void> {
    await this.navigate('/');
  }

  async assertHomeVisible(): Promise<void> {
    await expect(this.getStartedLink).toBeVisible();
  }

  async goToGetStarted(): Promise<void> {
    await this.getStartedLink.click();
    await this.waitForPageLoad();
  }

  async assertOnDocs(): Promise<void> {
    await this.assertUrlContains('docs');
    await expect(this.docsNav).toBeVisible();
  }
}
