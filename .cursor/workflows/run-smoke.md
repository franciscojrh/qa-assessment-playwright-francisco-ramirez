# Workflow: Run smoke (Cursor)

**Canonical procedure:** `AGENTS.md` → **Run tests** + **Smoke verification procedure**.

## Steps

1. Read those AGENTS.md sections.
2. Execute: `npm run typecheck && npm run test:smoke`
3. Confirm `test-results/report.json` and exit code `0`.

## Cursor-only (on failure)

Use **test-analyzer** MCP against `test-results/report.json`:

- `get_test_summary`
- `get_failures`
- `get_slowest_tests`

Then follow AGENTS.md → **Triage local failures**.
