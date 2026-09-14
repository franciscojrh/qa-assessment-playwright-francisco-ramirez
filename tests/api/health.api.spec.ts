import { test, expect } from '@fixtures';
import { API_CONFIG } from '@data/constants';

/**
 * Example API regression. Skipped until API_BASE_URL is configured.
 * Replace path/assertions with your health or ping endpoint.
 */
test('API base is reachable @regression', async ({ httpApi }) => {
  test.skip(
    !API_CONFIG.baseUrl,
    'Set API_BASE_URL in .env.dev to enable API tests',
  );

  const response = await httpApi.get('/');
  // Adjust expected status for your API root / health route.
  expect([200, 301, 302, 404]).toContain(response.status());
});
