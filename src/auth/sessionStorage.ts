import * as fs from 'fs';
import * as path from 'path';

import type { BrowserContext, Page } from '@playwright/test';

import { AUTH_FILES } from '@data/constants';

const root = path.resolve(__dirname, '../..');

export function authStorageStatePath(): string {
  return path.resolve(root, AUTH_FILES.STORAGE_STATE);
}

export function authSessionStoragePath(): string {
  return path.resolve(root, AUTH_FILES.SESSION_STORAGE);
}

export function ensureAuthDir(): void {
  const dir = path.dirname(authStorageStatePath());
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Dump window.sessionStorage for later restore.
 * Playwright storageState does not persist sessionStorage (needed for oidc-client-ts).
 */
export async function saveSessionStorage(page: Page): Promise<void> {
  ensureAuthDir();
  const data = await page.evaluate(() => {
    const out: Record<string, string> = {};
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key) out[key] = sessionStorage.getItem(key) ?? '';
    }
    return out;
  });
  fs.writeFileSync(authSessionStoragePath(), JSON.stringify(data, null, 2));
}

/**
 * Inject saved sessionStorage before app scripts run on every navigation.
 */
export async function restoreSessionStorage(
  context: BrowserContext,
): Promise<void> {
  const filePath = authSessionStoragePath();
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing sessionStorage dump at ${filePath}. Enable Cognito globalSetup first.`,
    );
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as Record<
    string,
    string
  >;
  await context.addInitScript((entries: Record<string, string>) => {
    for (const [key, value] of Object.entries(entries)) {
      window.sessionStorage.setItem(key, value);
    }
  }, data);
}
