---
description: Run Playwright smoke + typecheck
allowed-tools: Bash(npm:*), Bash(npx playwright:*)
---

Read `AGENTS.md` (Run tests + Smoke verification procedure).

Then run from the repo root:

```bash
npm run typecheck && npm run test:smoke
```

Report typecheck, smoke counts, and on failure paths to `test-results/report.json` and `playwright-report/`.

On failure, follow `AGENTS.md` → **Triage local failures**.
