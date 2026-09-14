# Workflow: Pre-PR QA (Cursor)

**Canonical procedure:** `AGENTS.md` → **Pre-PR QA check**.

## Steps

1. Follow that AGENTS.md section.
2. Run Review checklist on changed files.
3. Run `npm run typecheck && npm run test:smoke`.

## Cursor-only

- **test-analyzer MCP:** `get_test_summary` on `test-results/report.json`.

## Output

PR title, summary bullets, test plan, and ready-to-ship verdict.
