---
description: Debug a failed CI Playwright smoke job
argument-hint: [PR number, branch, or workflow run URL]
allowed-tools: Bash(gh:*), Bash(npm:*), Bash(npx playwright:*), Read, Grep, Glob
---

Help debug a failed E2E smoke CI job for: $ARGUMENTS

Follow `AGENTS.md` → **Debug CI E2E failure**.

Reproduce: `npm ci && npx playwright install --with-deps chromium && npm run test:smoke`

Summarize: root cause, failing test, fix, verification.
