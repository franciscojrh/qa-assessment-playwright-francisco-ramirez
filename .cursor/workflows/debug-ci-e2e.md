# Workflow: Debug CI E2E (Cursor)

**Canonical procedure:** `AGENTS.md` → **Debug CI E2E failure**.

## Steps

1. Read that AGENTS.md section and follow it.

## Cursor-only

- **GitHub MCP** / `gh`: checks, artifacts (see `.cursor/mcp.optional.example.json`).
- **test-analyzer MCP:** after downloading reports, `get_failures`.

Point `PLAYWRIGHT_JSON_REPORT` at extracted CI `report.json` if needed.
