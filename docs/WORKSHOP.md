# Workshop stub — Playwright QA seed + AI-assisted automation

This repo is the Playwright + MCP **assessment**; candidates follow [`ASSESSMENT_BRIEF.md`](../ASSESSMENT_BRIEF.md). Canonical rules remain [`AGENTS.md`](../AGENTS.md).

Upskill QAs at all levels using **this repo** as the lab. Expand each module into slides/labs before the first delivery; keep exercises runnable against the seed’s default smoke target (`playwright.dev`) unless noted.

---

## Goals

- Shared Playwright + TypeScript habits (POM, tags, fixtures, secrets).
- Confident use of AI (Cursor / Claude) **within** those standards — not instead of them.
- A path from “run smoke” → “own a feature suite” → “triage CI.”

## Audience tracks

| Track | Who | Outcome |
|-------|-----|---------|
| Foundations | Manual / junior QA | Clone, run, read a POM, change one assertion safely |
| Builder | Mid QA / SDET | New POM + `@smoke` / `@regression` spec; selector strategy |
| Owner | Senior QA / SDET | Auth recipe, API lane, CI gate, triage with MCP (test-analyzer; GitHub / Qase / Jira or other org tools **if** allowlisted) |

Run tracks in parallel labs where possible; share debriefs as one group.

---

## Agenda (draft — fill durations when scheduling)

### 0. Kickoff

- Why a seed (consistency + speed).
- Tour: `AGENTS.md`, folder layout, `TEMPLATE_CHECKLIST.md`.
- AI rule: agents follow `AGENTS.md`; humans review Blockers before merge.

### 1. Foundations lab

1. `npm ci && npm run setup`
2. `cp .env.example .env.dev`
3. `npm run typecheck && npm run test:smoke`
4. Open `tests/example.smoke.spec.ts` + `src/pages/ExamplePage.ts`
5. Exercise: tighten one assertion (still green); explain what broke if it fails

### 2. Builder lab

1. Workflow: `.cursor/workflows/new-pom.md` or Claude `/new-pom`
2. Exercise: add a small POM method + `@smoke` or `@regression` test (still against playwright.dev or a sandbox app)
3. Checklist: imports from `@fixtures`, no locators in the spec, tag in title

### 3. Owner lab

1. CI: `.github/workflows/ci-e2e.yml` — smoke as gate
2. Optional: skim `docs/recipes/cognito-hosted-ui.md` + `tests/api/`
3. Triage (baseline): fail a test on purpose → `npm run report` / trace → **test-analyzer** MCP
4. Triage (optional org MCP — **skippable**; GitHub / Qase / Atlassian are examples, not required):
   - Merge `.cursor/mcp.optional.example.json` into **local** `.cursor/mcp.json` (gitignored) **or** plug in your TMS/issue/CI MCP the same way
   - Wire tokens only for servers you use (`GITHUB_PERSONAL_ACCESS_TOKEN` / `QASE_API_TOKEN`; Atlassian uses OAuth on first connect)
   - Loop (example): CI failure → GitHub MCP (run/artifacts) → test-analyzer → classify → issue tracker (product bugs only) → TMS case/run link
   - Expect `.cursor/hooks/guard-mcp.py` to **ask** before create/update/transition tools — approve deliberately
5. Pre-PR: `.cursor/workflows/pre-pr-qa.md` or Claude `/pre-pr-qa`
6. Skill reference: `.claude/skills/mcp-tooling/SKILL.md`

### 4. Close

- Pods: create repo from template → [`TEMPLATE_CHECKLIST.md`](../TEMPLATE_CHECKLIST.md)
- Parking lot for product-specific IdP / `data-qa` requests

---

## Facilitator prep (TODO before first delivery)

- [ ] Confirm company Cursor / Claude access and MCP allowlist (local `test-analyzer`; **optionally** GitHub, Qase, Atlassian/Jira, **or other** org MCP)
- [ ] Issue workshop-scoped tokens only if using org MCP (prefer read) or confirm OAuth paths; never share PATs in chat/slides
- [ ] Decide lab app: seed demo only vs shared sandbox `BASE_URL`
- [ ] Print or pin review checklist from `AGENTS.md`
- [ ] Timebox each track; assign co-facilitators if multi-level room
- [ ] Add slide deck / recording links here when ready

## Follow-ups (post-workshop)

- Collect feedback; promote common exercises into `docs/workshop/` labs
- Keep this stub short; detailed labs should not duplicate `AGENTS.md`

---

## Related

- [`AGENTS.md`](../AGENTS.md) — runbook
- [`docs/GETTING_STARTED.md`](./GETTING_STARTED.md) — fast start + daily loop
- [`docs/ASSESSMENT.md`](./ASSESSMENT.md) — peer assessment overview
- [`TEMPLATE_CHECKLIST.md`](../TEMPLATE_CHECKLIST.md) — pod adoption
- [`docs/FRAMEWORK_OVERVIEW.md`](./FRAMEWORK_OVERVIEW.md) — diagrams
- [`.claude/skills/mcp-tooling/SKILL.md`](../.claude/skills/mcp-tooling/SKILL.md) — MCP decision tree
- [`.cursor/mcp.optional.example.json`](../.cursor/mcp.optional.example.json) — optional sample stubs (GitHub / Qase / Atlassian); replace with your tools
