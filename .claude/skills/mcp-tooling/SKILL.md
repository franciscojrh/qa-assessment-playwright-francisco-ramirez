---
name: mcp-tooling
description: >-
  Use in-repo test-analyzer MCP for Playwright report.json triage.
  GitHub/Qase/Atlassian MCP are optional examples, not required for the assessment.
---

# MCP Tooling — Playwright QA assessment

GitHub, Qase, and Atlassian entries in `.cursor/mcp.optional.example.json` are **samples**. Candidates do not need them. Merge only allowlisted servers you actually use; swap in Linear, Azure DevOps, TestRail, or another TMS/issue/CI MCP the same way. Never commit `.cursor/mcp.json` or tokens.

## Setup (optional — report triage)

1. `cd mcp-servers/test-analyzer && npm ci`
2. Copy `.cursor/mcp.json.example` → **local** `.cursor/mcp.json` (gitignored)
   - Or merge into your editor/user MCP config via `mcp-setup.example.json`
3. Report path: `test-results/report.json` (`PLAYWRIGHT_JSON_REPORT`)

## Optional servers (org tools — examples)

Copy entries from `.cursor/mcp.optional.example.json` into your **local** `.cursor/mcp.json` only when your org has approved tokens/allowlists. Never commit that file. Skip this entire section if you are not using org MCP.

| Server | Package / endpoint | Env / auth | Primary QA use |
|--------|--------------------|------------|----------------|
| `github` | `https://api.githubcopilot.com/mcp/` | `GITHUB_PERSONAL_ACCESS_TOKEN` (PAT) | CI runs, checks, artifacts, PR context |
| `qase` | `npx -y @qase/mcp-server` | `QASE_API_TOKEN` | Cases, runs, defects, traceability |
| `atlassian` | `npx -y mcp-remote https://mcp.atlassian.com/v1/mcp` | OAuth (browser) on first use | Jira defects / Confluence notes |

Notes:

- Prefer **read-scoped** tokens for workshops; approve write tools when the hook asks.
- Official Atlassian Rovo MCP uses OAuth — no API token in the example JSON.
- If your company ships different packages, keep this table’s shape and replace rows.
- Local Docker alternative for GitHub: `ghcr.io/github/github-mcp-server` (see GitHub’s install docs). Do **not** use deprecated `@modelcontextprotocol/server-github`.

## Decision tree

```
Need Playwright pass/fail details?
  → test-analyzer get_test_summary / get_failures

Need CI artifacts / PR checks / workflow run?
  → GitHub MCP (or gh CLI) + /debug-ci-e2e — skip GitHub MCP if not configured

Need test-case / run linkage in TMS?
  → Qase (or your TMS MCP) when configured; otherwise skip

Need a product defect from a reproducible failure?
  → Atlassian/Jira (or your issue-tracker MCP) when configured; skip otherwise
  → Prefer human approval on create/transition (guard-mcp hook)

Prefer slash commands for scripted flows: /run-e2e, /debug-ci-e2e, /pre-pr-qa
```

## Owner triage loop (when optional servers are enabled)

1. Smoke fails (local or CI)
2. **test-analyzer** → failing title, error, project
3. **GitHub** (or equivalent CI MCP) → workflow run / artifact / PR check — skip if unused
4. Classify per `AGENTS.md` (flaky / env / product / test bug)
5. **Issue tracker** → defect only for product bugs (ask before create) — skip if unused
6. **TMS** → link case / record run when your pod uses one — skip if unused

## Security

- Never commit tokens, `.env.dev`, `.auth/`, or `.cursor/mcp.json`
- `.cursor/hooks/guard-mcp.py` asks before write-ish tools on `github` / `qase` / `atlassian` / `jira`
- Prefer env vars or Cursor’s secret UI over pasting PATs into JSON
