import { test as baseTest, expect, type Page } from '@playwright/test';
import * as fs from 'fs';

import { createHttpClient, type HttpClient } from '../api';
import {
  authStorageStatePath,
  restoreSessionStorage,
} from '../auth/sessionStorage';
import { isCognitoMode } from '../data/constants';
import { ExamplePage } from '../pages/ExamplePage';

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
  /** Generic HTTP client for API specs. */
  httpApi: HttpClient;
  /** App page: Cognito session when enabled, else plain `{ page }`. */
  appPage: Page;
  authenticatedPage: Page;
  freshAuthPage: Page;
  /** Example POM for the default playwright.dev smoke target. */
  examplePage: ExamplePage;
  // Add custom page object fixture types here
};

/**
 * Extended Playwright Test Instance
 * Use this extended test fixture across all spec files (*.spec.ts).
 * Never instantiate Page Objects directly using `new MyPage(page)` inside specs.
 */
export const test = baseTest.extend<CustomFixtures>({
  httpApi: async ({ request }, use) => {
    await use(createHttpClient(request));
  },

  appPage: async ({ page, browser, baseURL }, use) => {
    if (!isCognitoMode()) {
      await use(page);
      return;
    }

    const sessionPath = authStorageStatePath();
    if (!fs.existsSync(sessionPath)) {
      throw new Error(
        `Cognito mode requires ${sessionPath}. Ensure globalSetup ran successfully.`,
      );
    }

    const context = await browser.newContext({
      storageState: sessionPath,
      baseURL,
    });
    await restoreSessionStorage(context);
    const authPage = await context.newPage();
    await use(authPage);
    await context.close();
  },

  authenticatedPage: async ({ browser, baseURL }, use) => {
    if (!isCognitoMode()) {
      throw new Error(
        '{ authenticatedPage } requires Cognito mode. See docs/recipes/cognito-hosted-ui.md',
      );
    }

    const sessionPath = authStorageStatePath();
    if (!fs.existsSync(sessionPath)) {
      throw new Error(`Missing ${sessionPath}. Run globalSetup in Cognito mode.`);
    }

    const context = await browser.newContext({
      storageState: sessionPath,
      baseURL,
    });
    await restoreSessionStorage(context);
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  freshAuthPage: async ({ browser, baseURL }, use) => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  examplePage: async ({ appPage }, use) => {
    await use(new ExamplePage(appPage));
  },

  // Register additional fixture implementations here. Example:
  // loginPage: async ({ page }, use) => {
  //   const loginPage = new LoginPage(page);
  //   await use(loginPage);
  // },
});

export { expect };
