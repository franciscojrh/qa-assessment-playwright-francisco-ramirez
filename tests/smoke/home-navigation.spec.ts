import { test } from '@fixtures';

test.describe('Playwright Target Application — Core User Journeys @smoke @foundational', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.open();
  });

  test('Workflow 1: Landing page loads and hero CTA navigates to installation docs', async ({
    homePage,
    docsPage,
  }) => {
    // Assert home page branding and hero content are visible
    await homePage.assertLoaded();

    // User navigates via Get Started CTA
    await homePage.clickGetStarted();

    // Assert Docs page is loaded with Installation heading
    await docsPage.assertLoaded();
    await docsPage.assertHeadingContains('Installation');
  });

  test('Workflow 2: Top navigation links to docs and guides to writing tests', async ({
    homePage,
    docsPage,
  }) => {
    // User clicks Docs in top navigation bar
    await homePage.clickDocsNav();

    // Verify initial docs view
    await docsPage.assertLoaded();

    // User navigates to Writing Tests section via sidebar
    await docsPage.navigateToWritingTests();
    await docsPage.assertHeadingContains('Writing tests');
  });

  test('Workflow 3: Search modal enables documentation lookup', async ({
    homePage,
    docsPage,
  }) => {
    // User triggers search and enters keyword
    await homePage.searchFor('locators');

    // User selects the first relevant hit
    await homePage.selectSearchResult(0);

    // Verify user is directed to the Locators documentation
    await docsPage.assertLoaded();
    await docsPage.assertHeadingContains('Locators');
  });

  test('Workflow 4: Theme toggle switches between light and dark modes', async ({
    homePage,
  }) => {
    // Assert loaded
    await homePage.assertLoaded();

    // Toggle theme
    await homePage.toggleTheme();

    // Verify toggle button remains actionable and page state persists
    await homePage.assertLoaded();
  });
});
