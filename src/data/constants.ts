/**
 * Env-backed constants. Never hardcode secrets — read from process.env.
 */

export const API_CONFIG = {
  baseUrl: (process.env.API_BASE_URL || '').replace(/\/$/, ''),
  apiKey: process.env.API_KEY || '',
};

/** Paths for optional Cognito session artifacts (see cognito recipe). */
export const AUTH_FILES = {
  STORAGE_STATE: '.auth/session.json',
  SESSION_STORAGE: '.auth/session-storage.json',
};

export const TEST_CREDENTIALS = {
  user: process.env.E2E_USER || '',
  password: process.env.E2E_PASSWORD || '',
};

/**
 * True when Cognito globalSetup should run.
 * Override with E2E_AUTH=cognito | local | none.
 */
export function isCognitoMode(): boolean {
  const override = (process.env.E2E_AUTH || '').toLowerCase();
  if (override === 'cognito') return true;
  if (override === 'local' || override === 'none') return false;

  const base = process.env.BASE_URL || '';
  const hasCreds = Boolean(TEST_CREDENTIALS.user && TEST_CREDENTIALS.password);
  const isLocalhost = /localhost|127\.0\.0\.1/.test(base);
  return hasCreds && Boolean(base) && !isLocalhost;
}
