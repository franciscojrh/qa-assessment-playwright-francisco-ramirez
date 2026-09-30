import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Page Object Model for the TodoMVC application (https://demo.playwright.dev/todomvc).
 * Manages reactive state transitions, dynamic list modifications, and route interception.
 */
export class TodoPage extends BasePage {
  private readonly heading: Locator;
  private readonly newTodoInput: Locator;
  private readonly todoItems: Locator;
  private readonly todoTitles: Locator;
  private readonly toggleAllCheckbox: Locator;
  private readonly todoCounter: Locator;
  private readonly filterAllLink: Locator;
  private readonly filterActiveLink: Locator;
  private readonly filterCompletedLink: Locator;
  private readonly clearCompletedButton: Locator;
  private readonly footerSection: Locator;

  constructor(page: Page) {
    super(page);

    this.heading = page.getByRole('heading', { level: 1, name: 'todos' });
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.todoItems = page.locator('.todo-list li');
    this.todoTitles = page.locator('.todo-list li label');
    this.toggleAllCheckbox = page.getByLabel('Mark all as complete');
    this.todoCounter = page.locator('.todo-count');
    this.filterAllLink = page.getByRole('link', { name: 'All', exact: true });
    this.filterActiveLink = page.getByRole('link', { name: 'Active', exact: true });
    this.filterCompletedLink = page.getByRole('link', { name: 'Completed', exact: true });
    this.clearCompletedButton = page.getByRole('button', { name: 'Clear completed' });
    this.footerSection = page.locator('footer.footer');
  }

  /**
   * Navigate to the TodoMVC application.
   */
  public async open(url: string = 'https://demo.playwright.dev/todomvc'): Promise<void> {
    await this.page.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Assert the page is loaded and input field is ready.
   */
  public async assertLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible();
    await expect(this.newTodoInput).toBeVisible();
  }

  /**
   * Add a single todo item.
   */
  public async addTodo(title: string): Promise<void> {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  /**
   * Add multiple todo items sequentially.
   */
  public async addTodos(titles: string[]): Promise<void> {
    for (const title of titles) {
      await this.addTodo(title);
    }
  }

  /**
   * Resolve an individual todo item locator by title or zero-based index.
   */
  private resolveItem(textOrIndex: string | number): Locator {
    if (typeof textOrIndex === 'number') {
      return this.todoItems.nth(textOrIndex);
    }
    return this.todoItems.filter({ hasText: textOrIndex });
  }

  /**
   * Toggle completion state of a todo item.
   */
  public async toggleTodo(textOrIndex: string | number): Promise<void> {
    const item = this.resolveItem(textOrIndex);
    const checkbox = item.getByLabel('Toggle Todo');
    await checkbox.click();
  }

  /**
   * Inline edit a todo item's title and commit changes with Enter.
   */
  public async editTodo(targetTitle: string, newTitle: string): Promise<void> {
    const item = this.resolveItem(targetTitle);
    const label = item.locator('label');
    await label.dblclick();

    const editInput = item.getByLabel('Edit');
    await expect(editInput).toBeVisible();
    await editInput.fill(newTitle);
    await editInput.press('Enter');
  }

  /**
   * Inline edit a todo item and cancel with Escape.
   */
  public async cancelEditTodo(targetTitle: string, abortedTitle: string): Promise<void> {
    const item = this.resolveItem(targetTitle);
    const label = item.locator('label');
    await label.dblclick();

    const editInput = item.getByLabel('Edit');
    await expect(editInput).toBeVisible();
    await editInput.fill(abortedTitle);
    await editInput.press('Escape');
  }

  /**
   * Delete an item by hovering and clicking the destroy button.
   */
  public async deleteTodo(textOrIndex: string | number): Promise<void> {
    const item = this.resolveItem(textOrIndex);
    await item.hover();
    const deleteButton = item.locator('button.destroy');
    await deleteButton.click({ force: true });
  }

  /**
   * Toggle all items as complete / active.
   */
  public async toggleAll(): Promise<void> {
    await this.toggleAllCheckbox.click();
  }

  /**
   * Select a filter view (All, Active, Completed).
   */
  public async filterBy(filter: 'All' | 'Active' | 'Completed'): Promise<void> {
    switch (filter) {
      case 'All':
        await this.filterAllLink.click();
        break;
      case 'Active':
        await this.filterActiveLink.click();
        break;
      case 'Completed':
        await this.filterCompletedLink.click();
        break;
    }
  }

  /**
   * Clear all completed items via the footer button.
   */
  public async clearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
  }

  /**
   * Assert exact visible item count.
   */
  public async assertItemCount(expectedCount: number): Promise<void> {
    await expect(this.todoItems).toHaveCount(expectedCount);
  }

  /**
   * Assert sequential visible item titles.
   */
  public async assertItemTitles(expectedTitles: string[]): Promise<void> {
    await expect(this.todoTitles).toHaveText(expectedTitles);
  }

  /**
   * Assert active items remaining counter text.
   */
  public async assertCounterText(expectedText: string): Promise<void> {
    await expect(this.todoCounter).toHaveText(expectedText);
  }

  /**
   * Assert completion state of a specific item.
   */
  public async assertItemCompleted(textOrIndex: string | number, isCompleted: boolean): Promise<void> {
    const item = this.resolveItem(textOrIndex);
    const checkbox = item.getByLabel('Toggle Todo');
    if (isCompleted) {
      await expect(checkbox).toBeChecked();
      await expect(item).toHaveClass(/completed/);
    } else {
      await expect(checkbox).not.toBeChecked();
      await expect(item).not.toHaveClass(/completed/);
    }
  }

  /**
   * Assert footer visibility.
   */
  public async assertFooterVisible(isVisible: boolean): Promise<void> {
    if (isVisible) {
      await expect(this.footerSection).toBeVisible();
    } else {
      await expect(this.footerSection).toBeHidden();
    }
  }

  /**
   * Intercept client routes using page.route() to test resilience or mock external calls.
   */
  public async mockNetworkRoute(urlPattern: string | RegExp, responseData: object, status: number = 200): Promise<void> {
    await this.page.route(urlPattern, async (route) => {
      await route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(responseData),
      });
    });
  }

  /**
   * Simulate network latency via route interception.
   */
  public async simulateNetworkDelay(urlPattern: string | RegExp, delayMs: number): Promise<void> {
    await this.page.route(urlPattern, async (route) => {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      await route.continue();
    });
  }
}
