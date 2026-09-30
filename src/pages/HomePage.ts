import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for the Playwright.dev Home landing page.
 * Follows strict accessibility-first locator hierarchy and POM encapsulation.
 */
export class HomePage extends BasePage {
  // Navigation Bar Locators
  private readonly brandLogo: Locator;
  private readonly docsNavLink: Locator;
  private readonly apiNavLink: Locator;
  private readonly mcpNavLink: Locator;
  private readonly cliNavLink: Locator;
  private readonly githubNavLink: Locator;
  private readonly discordNavLink: Locator;
  private readonly themeToggleButton: Locator;
  private readonly searchButton: Locator;

  // Search Modal Locators
  private readonly searchInput: Locator;
  private readonly searchResultOptions: Locator;

  // Hero Section Locators
  private readonly heroHeading: Locator;
  private readonly getStartedLink: Locator;
  private readonly starRepoLink: Locator;

  constructor(page: Page) {
    super(page);

    // Navigation locators using accessibility roles and labels
    this.brandLogo = page.getByRole('link', { name: 'Playwright', exact: true });
    this.docsNavLink = page.getByRole('link', { name: 'Docs', exact: true }).first();
    this.apiNavLink = page.getByRole('link', { name: 'API', exact: true });
    this.mcpNavLink = page.getByRole('link', { name: 'MCP', exact: true });
    this.cliNavLink = page.getByRole('link', { name: 'CLI', exact: true });
    this.githubNavLink = page.getByRole('link', { name: 'GitHub repository' });
    this.discordNavLink = page.getByRole('link', { name: 'Discord server' });
    this.themeToggleButton = page.getByRole('button', { name: /switch between dark and light mode/i });
    this.searchButton = page.getByRole('button', { name: /search/i });

    // Search Modal locators
    this.searchInput = page.getByPlaceholder('Search docs');
    this.searchResultOptions = page.getByRole('option');

    // Hero Section locators
    this.heroHeading = page.getByRole('heading', { level: 1 });
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
    this.starRepoLink = page.getByRole('link', { name: /star microsoft\/playwright on github/i });
  }

  /**
   * Navigate to the home page relative to baseURL.
   */
  public async open(): Promise<void> {
    await this.navigate('/');
  }

  /**
   * Assert the home page hero section and branding are visible.
   */
  public async assertLoaded(): Promise<void> {
    await expect(this.heroHeading).toBeVisible();
    await expect(this.getStartedLink).toBeVisible();
    await expect(this.brandLogo).toBeVisible();
  }

  /**
   * Click the Get Started CTA link.
   */
  public async clickGetStarted(): Promise<void> {
    await this.getStartedLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Click the primary Docs navigation link.
   */
  public async clickDocsNav(): Promise<void> {
    await this.docsNavLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Click the API navigation link.
   */
  public async clickApiNav(): Promise<void> {
    await this.apiNavLink.click();
    await this.waitForPageLoad();
  }

  /**
   * Open the search modal.
   */
  public async openSearchModal(): Promise<void> {
    await this.searchButton.click();
    await expect(this.searchInput).toBeVisible();
  }

  /**
   * Search for a query and wait for search results to appear.
   */
  public async searchFor(query: string): Promise<void> {
    await this.openSearchModal();
    await this.searchInput.fill(query);
    await expect(this.searchResultOptions.first()).toBeVisible();
  }

  /**
   * Select a search result by its index.
   */
  public async selectSearchResult(index: number = 0): Promise<void> {
    await this.searchResultOptions.nth(index).click();
    await this.waitForPageLoad();
  }

  /**
   * Dismiss the search modal via Escape key.
   */
  public async dismissSearch(): Promise<void> {
    await this.page.keyboard.press('Escape');
    await expect(this.searchInput).toBeHidden();
  }

  /**
   * Toggle between dark and light themes.
   */
  public async toggleTheme(): Promise<void> {
    await this.themeToggleButton.click();
  }

  /**
   * Assert the current theme applied to the document element.
   */
  public async assertTheme(expectedTheme: 'dark' | 'light'): Promise<void> {
    await expect(this.page.locator('html')).toHaveAttribute('data-theme', expectedTheme);
  }
}
