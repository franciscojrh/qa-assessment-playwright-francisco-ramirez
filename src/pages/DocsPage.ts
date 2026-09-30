import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for the Playwright.dev Documentation views (/docs/*).
 * Follows strict accessibility-first locator hierarchy and POM encapsulation.
 */
export class DocsPage extends BasePage {
  private readonly pageHeading: Locator;
  private readonly writingTestsLink: Locator;
  private readonly locatorsLink: Locator;
  private readonly searchButton: Locator;

  constructor(page: Page) {
    super(page);

    this.pageHeading = page.getByRole('heading', { level: 1 });
    this.writingTestsLink = page.getByRole('link', { name: 'Writing tests', exact: true }).first();
    this.locatorsLink = page.getByRole('link', { name: 'Locators', exact: true }).first();
    this.searchButton = page.getByRole('button', { name: /search/i });
  }

  /**
   * Navigate directly to documentation introduction.
   */
  public async open(): Promise<void> {
    await this.navigate('/docs/intro');
  }

  /**
   * Assert the documentation page is loaded with a visible heading.
   */
  public async assertLoaded(): Promise<void> {
    await this.assertUrlContains('docs');
    await expect(this.pageHeading).toBeVisible();
  }

  /**
   * Assert the level 1 heading contains the expected text.
   */
  public async assertHeadingContains(expectedText: string): Promise<void> {
    await expect(this.pageHeading).toContainText(expectedText);
  }

  /**
   * Navigate to the Writing Tests guide from documentation sidebar.
   */
  public async navigateToWritingTests(): Promise<void> {
    await this.writingTestsLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to the Locators guide from documentation sidebar.
   */
  public async navigateToLocators(): Promise<void> {
    await this.locatorsLink.click();
    await this.waitForPageLoad();
  }
}
