import { test as baseTest, expect } from '@playwright/test';

/**
 * Custom Fixtures Type Definition
 * Candidates should register their candidate-authored Page Object Models here.
 *
 * Example:
 * export type CustomFixtures = {
 *   loginPage: LoginPage;
 *   dashboardPage: DashboardPage;
 * };
 */
export type CustomFixtures = {
  // Add custom page object fixture types here
};

/**
 * Extended Playwright Test Instance
 * Use this extended test fixture across all spec files (*.spec.ts).
 * Never instantiate Page Objects directly using `new MyPage(page)` inside specs.
 */
export const test = baseTest.extend<CustomFixtures>({
  // Register fixture implementations here. Example:
  // loginPage: async ({ page }, use) => {
  //   const loginPage = new LoginPage(page);
  //   await use(loginPage);
  // },
});

export { expect };
