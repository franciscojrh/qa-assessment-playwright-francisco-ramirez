import { type Page, expect } from '@playwright/test';

/**
 * Abstract Base Page Object Model
 * Candidates must extend this class for all Page Object classes authored in src/pages/
 */
export abstract class BasePage {
  protected readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate relative to configured baseURL. */
  public async navigate(path: string = ''): Promise<void> {
    await this.page.goto(path);
    await this.waitForPageLoad();
  }

  public async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('load');
  }

  public async assertUrlContains(expectedText: string): Promise<void> {
    await expect(this.page).toHaveURL((url) => url.href.includes(expectedText));
  }

  public async takeScreenshot(name: string): Promise<Buffer> {
    return await this.page.screenshot({
      path: `test-results/screenshots/${name}-${Date.now()}.png`,
      fullPage: true,
    });
  }

  /** Dismiss a visible close/cancel dialog if present. */
  public async dismissBlockingDialogIfPresent(): Promise<void> {
    const closeButton = this.page
      .getByRole('button', { name: /close|cancel|dismiss/i })
      .first();

    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  }
}
