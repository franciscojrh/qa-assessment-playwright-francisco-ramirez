# Workflow: New POM (Cursor)

**Canonical procedure:** `AGENTS.md` → **Rule 1 (POM encapsulation)** + **Rule 2 (fixture DI)** + coding standards.

## Steps

1. Read AGENTS.md sections above.
2. Implement POM in `src/pages/` (extend `BasePage`); add data in `src/data/constants.ts` when needed.
3. Always register the POM in `src/fixtures/test.fixture.ts`. Specs must import `test` / `expect` from `@fixtures` and must never use `new PageObject(page)` or locators.
4. Write the spec under `tests/[feature]/` with `@smoke` or `@regression`.
5. Run `npm run typecheck && npm run test:smoke`.

## Cursor-only (optional)

- Ticket / TMS / issue-tracker MCP **if configured** (see `.cursor/mcp.optional.example.json`). Otherwise skip.

Summarize files changed and test results.
