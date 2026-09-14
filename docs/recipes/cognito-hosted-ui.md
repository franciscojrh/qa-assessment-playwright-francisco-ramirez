# Recipe: Cognito Hosted UI (optional)

This seed ships with a **no-op** `global-setup.ts`. Use this recipe when your app uses Cognito Hosted UI + `oidc-client-ts` (or similar) and Playwright `storageState` alone is not enough (sessionStorage).

## When to enable

- Deployed app behind Cognito
- Local build that redirects to Hosted UI
- You have a dedicated E2E Cognito user (not a real staff account with PII)

## Steps

1. Set in `.env.dev`:

   ```bash
   BASE_URL=https://your-cloudfront-or-app.example
   E2E_USER=e2e-user@example.com
   E2E_PASSWORD=***
   E2E_AUTH=cognito
   ```

2. Implement `global-setup.ts` to:
   - Open login / Hosted UI
   - Fill username + password (prefer `getByRole` on visible fields)
   - Wait for return to the app
   - `context.storageState({ path: '.auth/session.json' })`
   - Call `saveSessionStorage(page)` from `src/auth/sessionStorage.ts`

3. Keep `{ appPage }` in specs — it already restores storageState + sessionStorage when `isCognitoMode()` is true.

4. Use `{ freshAuthPage }` for login/logout negative tests.

5. Never commit `.auth/` or passwords.

## Selector tips (Hosted UI)

- Prefer visible role/placeholder locators; Cognito may render duplicate hidden classic forms.
- Submit button accessible name is often `submit` or `Sign in` — use `/^(sign in|submit)$/i`.
- Increase timeouts in `playwright.config.ts` when Cognito is enabled (redirects are slower).

## CI

Require secrets for user/password and a variable for `BASE_URL`. Fail the job if they are missing — do not silently fall back to a public placeholder site.
