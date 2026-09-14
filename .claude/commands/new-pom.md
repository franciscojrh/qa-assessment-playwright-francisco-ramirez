---
description: Add a new Playwright POM and spec per AGENTS.md
argument-hint: [page name or URL path]
allowed-tools: Bash(npm:*), Bash(npx playwright:*), Read, Write, Edit, Grep, Glob
---

Add Playwright coverage for: $ARGUMENTS

Follow `AGENTS.md` → **Adding a new POM** and **Coding standards**:

1. Confirm scope (ticket if provided).
2. Create/update POM in `src/pages/`.
3. Add data to `src/data/constants.ts` when needed.
4. Register the POM in `src/fixtures/test.fixture.ts`. Specs must never use `new PageObject(page)`.
5. Spec under `tests/[feature]/` with `@smoke` or `@regression`.
6. `npm run typecheck && npm run test:smoke`
7. Summarize files and results.

Do not commit secrets, `.env.dev`, or `.auth/`.
