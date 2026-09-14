# Workflow: Getting started (Cursor)

Onboard a new QA/Dev to this seed. Walk them through, don't just dump commands.

**Guide:** `docs/GETTING_STARTED.md` · **Standards:** `AGENTS.md` (wins on conflict).

## Steps

1. Read `docs/GETTING_STARTED.md` and confirm Node 20+.
2. First run: `npm ci && npm run setup`, then `cp .env.example .env.dev`.
3. Verify: `npm run typecheck && npm run test:smoke` — expect green against `playwright.dev`.
4. Explain the mental model: spec → POM (`BasePage`) → fixtures (`@fixtures`); tags `@smoke` / `@regression`.
5. Walk the daily loop: branch → edit POM/spec → typecheck → focused test → `npm run report` if red → PR.
6. If they'll adopt for a product, point to `TEMPLATE_CHECKLIST.md`.

## Cursor-only (optional)

- Scaffold a first POM/spec via `.cursor/workflows/new-pom.md` or `/new-pom`.
- On failures, use **test-analyzer** MCP against `test-results/report.json`.

End by summarizing what was set up and the next recommended step.
