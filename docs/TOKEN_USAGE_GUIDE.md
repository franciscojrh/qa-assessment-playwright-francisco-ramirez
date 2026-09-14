# Cursor Token Usage Guide — Primary Prompt Efficiency

**Audience:** engineers & QA (assessment candidates and facilitators)  
**Goal:** Cut Cursor spend driven by primary/input tokens (especially Cache Read)  
**Related:** [`AGENTS.md`](../AGENTS.md), [`ASSESSMENT_BRIEF.md`](../ASSESSMENT_BRIEF.md), [`.claude/skills/mcp-tooling/SKILL.md`](../.claude/skills/mcp-tooling/SKILL.md)

---

## 1. Why this matters

On a typical heavy-usage report you may see:

| Metric | Example | Meaning |
|--------|---------|---------|
| Total tokens | ~142M | Mostly input, not output |
| Requests | ~380 | Few sessions, huge context each |
| Tokens / request | ~374k | Agent turns reloading large context |
| Cache Read | ~82% | Same chat history + tools resent every turn |
| Input (No Cache) | ~16% | New tool results / new files |
| Cache Write | ~1% | First-time context stored |
| Output | ~0.5% | Model replies — not the cost driver |

**Primary prompt** = everything sent *to* the model each turn: system/rules, MCP tool schemas, chat history, `@` files, and tool results.

You are not “writing too much.” You are **reloading a huge prompt** on every Agent step.

Cache Read is cheaper per token than fresh Input, but high volume still dominates the bill. Short chats + smaller baseline context reduce both Cache Read and Input (No Cache).

---

## 2. Operating rules (memorize these)

| Rule | Why |
|------|-----|
| **1 task = 1 chat** | Long Agent threads cause Cache Read to explode |
| **Pick the model once** | Mid-chat model switches bust cache → expensive Cache Write |
| **Ask for exploration; Agent for edits** | Exploration dumps files into context forever |
| **Name files in the prompt** | Avoids “explore the monorepo” tool sprawl |
| **MCP only when that phase needs it** | Every enabled MCP adds schemas to *every* Agent turn |
| **Slash commands over open-ended Agent** | `/run-e2e`, `/pre-pr-qa`, `/debug-ci-e2e` are bounded |

### Daily rhythm (QA)

1. Disable unused MCPs. Do not leave GitHub/Qase/Atlassian on unless you use them this chat.
2. Start ticket → short **Ask** chat: pull AC from [`ASSESSMENT_BRIEF.md`](../ASSESSMENT_BRIEF.md) (or Jira MCP **if** configured).
3. Implement → **new Agent** chat: one AC slice + `@` files.
4. Verify → terminal / `/run-e2e` (don’t loop full suites in Agent).
5. Fail? → **new** chat + test-analyzer only.
6. PR → **new** chat + `/pre-pr-qa`.

Never: one mega-chat from “read the brief” → “write all POMs” → “fix CI” → “open PR”.

---

## 3. Token budget checklist

Use **before every Agent send**. If most boxes are unchecked, rewrite the prompt or start a new chat.

### Before you open Agent

- [ ] **Goal is one outcome** (e.g. “POM: search + empty state”, not “do all ticket ACs”)
- [ ] **Files named** — `@path/File.ts` (2–4 files max)
- [ ] **Out of scope stated**
- [ ] **Mode fits** — Ask = read/explain; Agent = edit
- [ ] **Model fits** — routine work → cheaper/Auto; hard debug → frontier once

### Context hygiene

- [ ] **New chat** if prior thread already ran smoke, CI triage, or >~10 Agent turns
- [ ] **No dump** of full logs, PDFs, or huge diffs
- [ ] **No “@codebase” / “explore everything”**
- [ ] **Don’t re-@** `AGENTS.md` if project rules already cover them

### MCP budget

- [ ] **Only MCPs needed this phase are enabled** (GitHub / Qase / Atlassian are **examples**; skip if unused)
  - Start ticket → issue-tracker MCP only **if used**; otherwise paste the brief
  - Local fail → test-analyzer only
  - CI fail → GitHub MCP + test-analyzer **if** GitHub MCP is configured
  - Cases/defects → TMS MCP only then **if used**
- [ ] **One MCP call, then paste the AC into the next chat**
- [ ] Prefer a single issue fetch over Teamwork Graph `full`

Optional MCP setup: [`AGENTS.md`](../AGENTS.md) §11.

### During Agent

- [ ] **Stop if it wanders** — interrupt; new chat with a tighter prompt
- [ ] **You run tests in terminal** when possible
- [ ] **No model switch mid-thread**

### Exit criteria

- [ ] **Done = AC checklist item(s) checked**
- [ ] **Next AC = new chat** with a 3-line recap of what already landed

**Token budget** = budgeting chat length, file attachments, and MCP surface area like money.

---

## 4. Daily MCP usage (plug in / unplug)

MCP tools are cheap *per call* but expensive when **always on** (schemas ride in every primary prompt).

| Phase | Enable (examples — skip unused) | Disable | Prompt style |
|-------|--------|---------|--------------|
| Scope ticket | Issue tracker MCP **if used** | GitHub, TMS, test-analyzer | “AC only; no code” — or read `ASSESSMENT_BRIEF.md` |
| Implement tests | *(none)* | all MCP | `@src/pages/ExamplePage.ts` + one AC |
| Local fail | test-analyzer | others | `get_failures` only |
| CI fail | GitHub MCP + test-analyzer **if configured** | issue tracker, TMS | `/debug-ci-e2e` |
| TMS sync | Qase or other TMS MCP **if used** | others | after code is green |
| PR | optional GitHub MCP | others | `/pre-pr-qa` |

### Anti-patterns

- Leaving all 4 MCPs enabled all day
- “Read ticket, implement everything, create TMS cases, check CI” in one Agent
- Re-fetching the same ticket every chat (paste AC once)

---

## 5. Worked example — facilitator ticket (generic)

**Ticket pattern:** `TICKET-42` — extend the playwright.dev smoke POM and spec (home load + Get started → docs); `@smoke`; register fixtures in `src/fixtures/test.fixture.ts`.

This is a **fictional** ticket id for training. Use your facilitator’s real id when you have one.

### Chat 0 — Scope (Ask; no MCP unless the brief is in an issue tracker)

Read [`ASSESSMENT_BRIEF.md`](../ASSESSMENT_BRIEF.md) (or fetch AC via Jira/Linear MCP **only if** that server is configured).

```
From the assessment brief (or TICKET-42 if provided), list acceptance criteria only.
Return: numbered AC checklist, out of scope, suggested file paths under src/pages/ and tests/smoke/.
Do not explore the repo. Do not write code.
```

Copy the checklist. Close the chat.

### Chat 1 — POM slice (Agent, MCP off)

```
TICKET-42 AC1 only: Keep ExamplePage POM for home + Get started navigation.
@src/pages/ExamplePage.ts
@AGENTS.md
Register any new POM in src/fixtures/test.fixture.ts. Specs must never use new PageObject(page).
Do not write new specs yet. Do not run the full suite.
```

### Chat 2 — Specs for smoke flows (new Agent)

```
TICKET-42 AC2: home page loads; Get started navigates to docs.
@src/pages/ExamplePage.ts
@src/fixtures/test.fixture.ts
@tests/smoke/sample.spec.ts
Tag @smoke. Import test/expect from @fixtures. No locators in the spec.
Stop after these two behaviors.
```

### Chat 3–4 — Further ACs (if the brief has more)

Same pattern: **one prompt**, named files, **one AC group**, new chat each time.

### Verify (terminal — $0 model tokens)

```bash
npm run typecheck && npm run test:smoke
```

### Chat 5 — only if fails (test-analyzer on)

```
Use test-analyzer get_failures on test-results/report.json.
Propose the smallest fix in ExamplePage or tests/smoke/sample.spec.ts.
Do not re-read the whole repo.
```

### Chat 6 — TMS (Qase or other TMS MCP, after green — skip if unused)

```
Create/link TMS cases for the ACs we implemented (only if a TMS MCP is configured).
Do not modify Playwright files.
```

### Chat 7 — Pre-PR

```
/pre-pr-qa
```

### Expected savings

| Approach | Cost pattern |
|----------|--------------|
| One chat: tracker + all ACs + smoke + TMS + PR | Cache Read balloons; 100k–1M+ tokens/session |
| Chats 0–7 as above | Bounded Cache Read per chat |

---

## 6. Copy-paste prompt template (any facilitator ticket)

```
Ticket: TICKET-XX
This chat: AC N only — <one sentence>
Files: @src/pages/ExamplePage.ts @tests/smoke/sample.spec.ts
Constraints: follow AGENTS.md; import from @fixtures; register POMs in test.fixture.ts; @smoke or @regression; no secrets; no scope creep
Do NOT: explore repo, put locators or new PageObject in specs, run full smoke unless I ask
Done when: <1–2 measurable checks>
```

---

## 7. Training exercises (30–45 min)

1. **Dashboard read** — Open Cursor usage; identify Cache Read vs Output %. What does that imply?
2. **Rewrite a bad prompt** — Take “Implement all of TICKET-42 and fix CI” → 4 scoped prompts.
3. **MCP drill** — For “local smoke failed”, which MCP to enable? Which to disable?
4. **Live practice** — Run one AC on a small POM change using the template; time the chat and count Agent turns (target ≤ 8–10).

### Facilitator talking points

- Output optimization is a distraction at ~0.5% of tokens.
- Always-on MCP is a silent tax on every turn.
- New chat is a feature, not a failure.
- Terminal for tests; Agent for edits.

---

## 8. Quick reference card

| Do | Don’t |
|----|-------|
| New chat per AC | Marathon Agent threads |
| `@` 2–4 files | `@codebase` / explore all |
| MCP per phase | All MCPs always on |
| Ask → then Agent | Agent for pure reading |
| Terminal for smoke | Agent loops full suite |
| One model per chat | Switch models mid-thread |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-08-11 | Initial guide from Cursor token dashboard review (primary prompt / Cache Read focus) |
| 2026-09-14 | Examples aligned to this assessment repo; removed product-specific ticket samples |
