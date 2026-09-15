# MCP Guide — Playwright QA Seed

Optional Model Context Protocol (MCP) tooling for Playwright report triage and (when your org allowlists them) GitHub / Qase / Jira. **Not required** to run tests or ship code — use slash commands, Cursor workflows, and the terminal for day-to-day work.

> **Canonical Cursor setup:** copy [`.cursor/mcp.json.example`](../.cursor/mcp.json.example) → **local** `.cursor/mcp.json` (gitignored). Editor-agnostic copy: [`mcp-setup.example.json`](../mcp-setup.example.json). Never commit tokens or local MCP config.

`AGENTS.md` is the runbook if anything here conflicts.

---

## Quick start

1. **Node 20+** (see `AGENTS.md`).
2. Install the local test-analyzer server:

   ```bash
   cd mcp-servers/test-analyzer && npm ci
   ```

3. Copy `.cursor/mcp.json.example` to `.cursor/mcp.json` (or merge `mcp-setup.example.json` into your editor/user MCP config). Reload MCP.

4. Generate a JSON report, then verify:

   ```bash
   npm run test:smoke
   ```

   Prompt: “Summarize the last Playwright smoke run.”

5. **Optional org tools** (GitHub, Qase, Atlassian): merge entries from [`.cursor/mcp.optional.example.json`](../.cursor/mcp.optional.example.json) into **local** `.cursor/mcp.json` only when tokens and MCP allowlists are approved. Prefer env vars or the editor secret UI over pasting PATs into JSON.

---

## Servers at a glance

| MCP | Type | Required for seed? | Purpose |
|-----|------|--------------------|---------|
| **test-analyzer** | Local (`node`) | Recommended for triage | Analyze Playwright JSON reports (local + CI artifacts) |
| **github** | Hosted (PAT) | Optional | PRs, reviews, CI checks, workflow artifacts |
| **qase** | `npx` `@qase/mcp-server` | Optional | Test cases, runs, defects |
| **atlassian** | `npx` `mcp-remote` + OAuth | Optional | Jira issues / Confluence (org cloud) |

This repo **does not** ship a `mcp-servers/qase/` wrapper. Qase (and GitHub / Atlassian) live only in the optional example until you merge them locally.

---

## 1. test-analyzer (Playwright JSON)

Local server at `mcp-servers/test-analyzer/` (`index.mjs`). Reads `test-results/report.json` via `PLAYWRIGHT_JSON_REPORT` (set in `.cursor/mcp.json.example`).

**Generate a report:**

```bash
npm run test:smoke
```

Playwright writes JSON to `test-results/report.json` (`playwright.config.ts`).

**CI artifacts:** download the `playwright-reports` artifact from the failed workflow, copy `report.json` to `test-results/`, or set `PLAYWRIGHT_JSON_REPORT` to the downloaded path.

### Tools

| Tool | When to use |
|------|-------------|
| `get_test_summary` | Pass/fail/flaky/skipped counts and total duration after a run |
| `get_failures` | Failed specs with error messages (local triage or CI debug) |
| `get_slowest_tests` | Top N slow specs (`limit` optional, default 5) |
| `get_flaky_candidates` | Tests that passed only after retry |
| `compare_browsers` | Per-project breakdown (`smoke` / `regression` / chromium / firefox / webkit) |

### Example prompts

- "Summarize the last Playwright smoke run."
- "List failures from the CI report I copied to test-results/."
- "What are the five slowest e2e specs?"

---

## 2. GitHub (CI, PRs, artifacts) — optional

Hosted MCP using a GitHub PAT. Merge from `.cursor/mcp.optional.example.json`:

```json
"github": {
  "url": "https://api.githubcopilot.com/mcp/",
  "headers": {
    "Authorization": "Bearer ${GITHUB_PERSONAL_ACCESS_TOKEN}"
  }
}
```

1. Create a [GitHub PAT](https://github.com/settings/tokens) scoped to **this** repo (or your org):
   - Fine-grained (recommended): **Pull requests** read/write, **Contents** read, **Actions** read-only, **Commit statuses** read-only
   - Org tokens may show **Pending** until an admin approves
   - Classic alternative: `repo` scope
2. Export `GITHUB_PERSONAL_ACCESS_TOKEN` (name matches the example JSON) or store it in Cursor’s secret UI
3. Authorize **SSO** for your org on the token if prompted

**Verify:** “List open PRs on this repository.”

Docs: [GitHub MCP Server](https://github.com/github/github-mcp-server)

Do **not** use deprecated `@modelcontextprotocol/server-github`. Docker alternative: `ghcr.io/github/github-mcp-server` (see GitHub’s install docs). `gh` CLI is a fine fallback.

### Common tools

| Tool | When to use |
|------|-------------|
| PR read / search | Description, diff summary, review comments |
| Commits | Branch history before review |
| Actions / check-run tools | Triage CI failures (pair with `/debug-ci-e2e`) |

### Example prompts

- "Summarize review comments on this PR."
- "Which CI checks failed on this branch?"

---

## 3. Qase (test management) — optional

Uses `@qase/mcp-server` via `npx` (no committed wrapper in this seed).

1. Create an API token: [app.qase.io](https://app.qase.io) → Settings → API tokens
2. Export `QASE_API_TOKEN`
3. Merge into local MCP config:

   ```json
   "qase": {
     "command": "npx",
     "args": ["-y", "@qase/mcp-server"],
     "env": {
       "QASE_API_TOKEN": "${QASE_API_TOKEN}"
     }
   }
   ```

**Verify:** "List Qase projects."

Package: [@qase/mcp-server](https://www.npmjs.com/package/@qase/mcp-server)

If the editor does not inherit `PATH` (`spawn npx ENOENT`), install the package locally or launch `node` against its `build/index.js` — keep that path in **local** config only.

### Example prompts

- "List test cases in our Qase project."
- "Create a defect linked to the failing smoke spec." (expect `guard-mcp` to **ask** before write tools)

---

## 4. Atlassian (Jira / Confluence) — optional

Official Atlassian Rovo MCP via `mcp-remote` (browser OAuth on first use — no API token in the example JSON):

```json
"atlassian": {
  "command": "npx",
  "args": ["-y", "mcp-remote", "https://mcp.atlassian.com/v1/mcp"]
}
```

**Verify:** "Summarize Jira ticket PROJ-1." (use your real key)

Docs: [Atlassian Rovo MCP — IDE setup](https://support.atlassian.com/atlassian-rovo-mcp-server/docs/setting-up-ides/)

Use **your** Jira project key. This seed is not tied to a specific cloud site or ticket prefix.

Prefer human approval on create/transition (the `.cursor/hooks/guard-mcp.py` hook asks before write-ish tools on `atlassian` / `jira`).

### Example prompts

- "What are the acceptance criteria for this ticket?"
- "List open tickets assigned to me."

If your company already ships a different Jira MCP package, keep that shape; update the optional example only when the org standard changes.

---

## Daily workflows

Prefer slash commands / Cursor workflows for scripted flows. MCP is extra context, not a substitute for `AGENTS.md`.

| Task | Command / workflow | MCP |
|------|--------------------|-----|
| First clone / smoke | `/getting-started` or `npm ci && npm run setup` | — |
| Run smoke + typecheck | `/run-e2e` | — |
| Add a POM + spec | `/new-pom` | Ticket MCP only if configured |
| Triage local failure | `/triage-failure` | test-analyzer `get_failures` + HTML report / trace |
| Triage CI failure | `/debug-ci-e2e` | GitHub checks/artifacts + test-analyzer on downloaded `report.json` |
| Pre-PR gate | `/pre-pr-qa` | — |
| Review Playwright diff | `/review-e2e` | — |
| Link TMS | — | Qase MCP (optional) |
| File product defect | — | Jira MCP — product bugs only; ask before create |

### Owner triage loop (when optional servers are enabled)

1. Smoke fails (local or CI)
2. **test-analyzer** → failing title, error, project
3. **GitHub** → workflow run / artifact / PR check (if CI)
4. Classify per `AGENTS.md` (flaky / env / product / test bug)
5. **Jira** → defect only for product bugs (ask before create)
6. **Qase** → link case / record run when your pod uses TMS

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| test-analyzer "report not found" | Run `npm run test:smoke` first; confirm `mcp-servers/test-analyzer` `npm ci`; check `PLAYWRIGHT_JSON_REPORT` |
| Qase MCP fails / `spawn npx ENOENT` | Editor PATH; verify `QASE_API_TOKEN`; or launch via local `node` path |
| GitHub MCP fails | Token **Pending**? Wait for org approval + SSO; env name is `GITHUB_PERSONAL_ACCESS_TOKEN`; scopes; reload MCP |
| Atlassian OAuth fails | Node 20+; complete browser OAuth; reload MCP |
| MCP write blocked / prompt to approve | Expected: `.cursor/hooks/guard-mcp.py` asks before create/update/delete-style tools on `github` / `qase` / `atlassian` / `jira` |
| MCP tools missing | Enable MCP for the agent; reload tools; confirm `.cursor/mcp.json` exists locally |

Never commit API tokens, `.env.dev`, `.auth/`, or `.cursor/mcp.json`.

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [`AGENTS.md`](../AGENTS.md) | Playwright runbook, coding standards, CI smoke, MCP setup |
| [`.cursor/mcp.json.example`](../.cursor/mcp.json.example) | test-analyzer Cursor template |
| [`mcp-setup.example.json`](../mcp-setup.example.json) | Same template for other editors |
| [`.cursor/mcp.optional.example.json`](../.cursor/mcp.optional.example.json) | GitHub / Qase / Atlassian stubs |
| [`.claude/skills/mcp-tooling/SKILL.md`](../.claude/skills/mcp-tooling/SKILL.md) | Agent skill — when to use which MCP |
| [`docs/WORKSHOP.md`](WORKSHOP.md) | Workshop loop including optional org MCP |
| [`docs/GETTING_STARTED.md`](GETTING_STARTED.md) | New-joiner loop |
| [`docs/TOKEN_USAGE_GUIDE.md`](TOKEN_USAGE_GUIDE.md) | Disable unused MCPs to cut prompt cost |
