import { test } from '@fixtures';

/**
 * Baseline smoke against playwright.dev.
 * Candidates: extend this suite and register additional Page Objects in
 * `src/fixtures/test.fixture.ts`. Specs must consume injected fixtures only.
 */
test.describe('Playwright.dev home @smoke @foundational', () => {
  test('home page loads', async ({ examplePage }) => {
    await examplePage.openHome();
    await examplePage.assertHomeVisible();
  });

  test('get started navigates to docs', async ({ examplePage }) => {
    await examplePage.openHome();
    await examplePage.goToGetStarted();
    await examplePage.assertOnDocs();
  });
});
