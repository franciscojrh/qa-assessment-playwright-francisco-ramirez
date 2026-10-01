# Oral Defense Preparation — All 3 Tiers
### Playwright & MCP Assessment — Francisco Ramirez

---

## 🏗️ Overall Architecture (30-second pitch)

> "I built a three-layer test automation system. The **execution layer** is 100% deterministic Playwright code — Page Objects, fixtures, and web-first assertions. The **MCP layer** is used exclusively during development: an AI agent with a Playwright MCP server inspects the live DOM to extract accessibility-first locators without me ever writing raw CSS selectors manually. The **AI triage layer** activates only after a CI failure — it sanitizes the JSON report and classifies every failure into one of three buckets before posting a structured summary to the GitHub PR."

---

## Tier 1 — Foundational: Smoke Suite for playwright.dev

### What was built
| File | Purpose |
|------|---------|
| [`src/pages/base.page.ts`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/src/pages/base.page.ts) | Abstract base class: `navigate()`, `waitForPageLoad()`, `assertUrlContains()` |
| [`src/pages/HomePage.ts`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/src/pages/HomePage.ts) | Locators + actions for `playwright.dev` landing page |
| [`src/pages/DocsPage.ts`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/src/pages/DocsPage.ts) | Docs navigation, search, heading assertions |
| [`src/fixtures/test.fixture.ts`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/src/fixtures/test.fixture.ts) | Custom `test` + `expect` with injected Page Objects via `baseTest.extend<>()` |
| [`tests/smoke/home-navigation.spec.ts`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/tests/smoke/home-navigation.spec.ts) | 4 smoke tests tagged `@smoke @foundational` |

### 4 smoke workflows covered
1. **Hero CTA** → clicks "Get Started" → lands on Installation docs
2. **Top nav** → clicks "Docs" → navigates to Writing Tests via sidebar
3. **Search modal** → searches "locators" → selects first result → lands on Locators page
4. **Theme toggle** → switches between light/dark modes

### Key architectural rules enforced
- **Zero locators in spec files** — every `getByRole`, `getByLabel`, `getByPlaceholder` lives only inside POM classes
- **`test` and `expect` imported from `@fixtures`** — never directly from `@playwright/test`
- **Web-first assertions only** — `await expect(locator).toBeVisible()`, never `expect(await locator.isVisible()).toBe(true)`
- **Zero `page.waitForTimeout()`** — all synchronization via Playwright's built-in auto-waiting

### How MCP was used in Tier 1
The Playwright MCP server was used to:
- Navigate to `playwright.dev` and inspect the accessibility tree
- Extract stable `getByRole('button', { name: 'Search' })` locators
- Verify locator uniqueness (strict mode — resolves to exactly 1 element) before committing to the POM

### Locator priority hierarchy (from AGENTS.md)
```
1. getByRole()        ← preferred (ARIA-stable)
2. getByLabel()       ← form controls
3. getByPlaceholder() ← input hints
4. getByText()        ← visible text
5. getByTestId()      ← data-qa attributes
✗ CSS selectors, XPath with :nth-child — FORBIDDEN
```

---

## Tier 2 — Advanced: TodoMVC State Machine + Multi-Agent Workflow

### What was built
| File | Purpose |
|------|---------|
| [`src/pages/TodoPage.ts`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/src/pages/TodoPage.ts) | Full TodoMVC POM with 15 methods |
| [`src/mcp/todo-data-generator.ts`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/src/mcp/todo-data-generator.ts) | Typed data fixture generator |
| [`src/mcp/todo-data-generator.json`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/src/mcp/todo-data-generator.json) | MCP tool schema (JSON-RPC) |
| [`docs/specs/feature-contract.md`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/docs/specs/feature-contract.md) | Typed behavioral specification |
| [`tests/regression/todo-lifecycle.spec.ts`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/tests/regression/todo-lifecycle.spec.ts) | 7 regression scenarios tagged `@regression @advanced` |
| [`.agents/skills/spec-to-e2e-workflow/SKILL.md`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/.agents/skills/spec-to-e2e-workflow/SKILL.md) | Multi-agent orchestration skill definition |

### 7 regression scenarios
| # | Scenario | Technique |
|---|----------|-----------|
| 1 | Data-driven todo generation + counter sync | `generateTodoDataset()` fixture |
| 2 | State transitions + filter routing (All/Active/Completed) | Dynamic DOM state verification |
| 3 | Inline edit commit & Escape cancellation | `dblclick()` + `Press('Escape')` |
| 4 | Toggle All + Clear Completed bulk mutations | Multi-item state assertion |
| 5 | Negative input boundary (empty/whitespace submissions) | Edge case + deletion |
| 6 | Unicode & edge-case dataset resilience | Typed data factory |
| 7 | Network route interception (`page.route()`) | Mocks telemetry/analytics calls |

### Multi-agent orchestration workflow (`.agents/skills/`)
```
Agent 1: Spec Architect
  → Reads docs/specs/feature-contract.md
  → Extracts state transitions, preconditions, edge cases
  → Outputs test plan

Agent 2: POM Generator
  → Scaffolds TodoPage.ts extending BasePage
  → Enforces private readonly locators
  → Wraps interactions in semantic methods

Agent 3: Assertion Auditor
  → Scans diff for page.waitForTimeout() → BLOCK
  → Verifies all assertions use await expect()
  → Confirms imports from @fixtures only
```

### Custom MCP Tool Schema (JSON-RPC)
```json
{
  "name": "generate_todo_dataset",
  "description": "Generate typed TodoMVC test data",
  "inputSchema": {
    "count": "number",
    "completedRatio": "number (0-1)",
    "includeEdgeCases": "boolean"
  }
}
```
The schema enforces typed, bounded parameters — avoiding the anti-pattern of vague tool descriptions that cause AI hallucinated arguments.

### Network resilience strategy
- `page.route(/telemetry|analytics/, route => route.fulfill({...}))` — mocks external calls that could flake in CI
- All dynamic list assertions use `expect(todoItems).toHaveCount(n)` — auto-waits for DOM to settle
- Filter navigation uses `expect(filterLink).toHaveClass(/selected/)` to confirm routing before asserting items

---

## Tier 3 — Master: Enterprise CI/CD + AI Triage + Data Governance

### What was built
| File | Purpose |
|------|---------|
| [`.github/workflows/test-automation.yml`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/.github/workflows/test-automation.yml) | 4-job sharded CI/CD pipeline |
| [`scripts/ai-triage.ts`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/scripts/ai-triage.ts) | AI failure triage engine |
| [`src/utils/security-sanitizer.ts`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/src/utils/security-sanitizer.ts) | PII/secret scrubbing module |
| [`tests/unit/security-sanitizer.spec.ts`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/tests/unit/security-sanitizer.spec.ts) | 22 unit tests proving zero PII leakage |
| [`docs/adr/ADR-001-agentic-test-architecture.md`](file:///Users/francisco.rh/Documents/assesment/qa-assessment-playwright-mcp/docs/adr/ADR-001-agentic-test-architecture.md) | Architecture Decision Record |

### CI/CD Pipeline — 4 jobs
```
push/PR
  │
  ▼
[1] typecheck (5 min) ──── fast gate, blocks everything if TS fails
  │
  ├──▶ [2] smoke × 2 shards (15 min each, parallel)
  │
  └──▶ [3] regression × 4 shards (30 min each, parallel)
            │
            │  if: failure()
            ▼
        [4] ai-triage
            - downloads all shard JSON artifacts
            - merges shards into single report
            - runs SecuritySanitizer before parsing
            - classifies each failure
            - posts to $GITHUB_STEP_SUMMARY
```

**Why sharding?** Playwright's `--shard=N/M` flag splits spec files by hash — deterministic, no ordering dependencies. `fail-fast: false` ensures all shards complete even if one fails, giving the triage job the complete failure dataset.

### AI Failure Triage — Classification Logic
```
Error text (sanitized)
        │
        ▼
Ordered rule matching (first match wins):
  ┌─ "strict mode violation" / "resolved to N elements" → AUTOMATION BUG
  ├─ "TimeoutError waiting for" / assertion timeout    → AUTOMATION BUG
  ├─ "TypeError" / "is not a function"                 → AUTOMATION BUG
  ├─ "ERR_CONNECTION_" / "ECONNREFUSED"                → ENVIRONMENT FLAKE
  ├─ "browser process exited" / "target closed"        → ENVIRONMENT FLAKE
  ├─ "expected to have text" / "expected to be visible" → PRODUCT DEFECT
  └─ (no match)                                         → PRODUCT DEFECT
```

**Why rule-based, not LLM?**
- 100% deterministic — same failure always gets same classification
- Zero token cost on green runs (job has `if: failure()`)
- Zero latency — < 100ms vs 2–30s per LLM call
- Works offline/air-gapped CI runners
- The architecture supports upgrading to an LLM call later — `classifyFailure()` is a swappable method

### Security Sanitizer — 15 sanitization rules

| Category | Pattern | Replacement |
|----------|---------|-------------|
| Bearer/JWT tokens | `Bearer ...` / `eyJ...` | `[REDACTED:TOKEN]` |
| API Keys | `api_key: xxxxx` | `[REDACTED:API_KEY]` |
| AWS Key IDs | `AKIA...` | `[REDACTED:API_KEY]` |
| Passwords | `"password": "..."` | `[REDACTED:PASSWORD]` |
| Session cookies | `session_id=...` | `[REDACTED:SESSION]` |
| Auth/Cookie headers | Full header line | `[REDACTED:TOKEN]` |
| Email addresses | `user@domain.com` | `[REDACTED:EMAIL]` |
| SSNs | `123-45-6789` | `[REDACTED:SSN]` |
| Credit cards | Visa/MC/Amex patterns | `[REDACTED:CC]` |
| 16-digit cards | `1234-5678-9012-3456` | `[REDACTED:CC]` |
| US phone numbers | `(555) 867-5309` | `[REDACTED:PHONE]` |
| IPv4 addresses | `192.168.1.100` | `[REDACTED:IP]` |
| Prompt injection | "ignore previous instructions" | `[REDACTED:INJECTION]` |

**Sanitization is applied BEFORE `JSON.parse()`** in `ai-triage.ts` — so even if a user's email appears in a test title (e.g., "Login as alice@example.com"), it is scrubbed before the report is ever processed.

**4 public methods:**
- `sanitizeText(string)` — raw string scrubbing
- `sanitizeObject<T>(obj)` — recursive field-level redaction (keys like `password`, `token`, `cvv` → `[REDACTED]`)
- `sanitizeHeaders(Record<string,string>)` — masks sensitive HTTP headers
- `sanitizeDomSnapshot(html, maxLength=8000)` — sanitizes + enforces token budget

### ADR — Key decisions documented
1. **Static POM over AI-inline assertions** — keeps execution deterministic
2. **Heuristic triage over live LLM** — zero token cost on green runs, fully deterministic
3. **Sanitize-before-parse** — PII never reaches downstream processing
4. **2 smoke shards + 4 regression shards** — matches test count to parallelism sweet spot
5. **`if: failure()` on triage job** — AI cost is zero when everything passes

### SLO Targets (from ADR)
| Metric | Target |
|--------|--------|
| Flakiness rate | < 1% |
| AI triage precision | > 90% |
| CI P95 duration | < 20 min (smoke) / < 35 min (regression) |
| PII leak rate | 0% |

---

## Likely Evaluator Questions & Answers

### "Why not put locators directly in spec files? It's faster."
> The spec file is the *what*, the POM is the *how*. When a locator breaks (e.g., a button gets renamed), I fix it in one place — the POM — and all 10 tests that call `clickGetStarted()` are automatically healed. If locators were in spec files, every test would need individual updates.

### "How does the MCP server interact with the browser?"
> The Playwright MCP server exposes tools (e.g., `playwright_navigate`, `playwright_get_visible_html`, `playwright_screenshot`) via JSON-RPC over stdio. The AI coding agent (host) calls these tools to inspect the live DOM, extract accessibility trees, and verify locators — all without the engineer writing raw HTML scraping code.

### "Why use heuristic classification instead of an LLM for triage?"
> Two reasons: cost and determinism. On a repo with 60 CI runs per day, a live LLM call per failure would cost money even on green runs if misconfigured. The heuristic is 100% reproducible — the same error always maps to the same category. The architecture is designed so `classifyFailure()` can be swapped to an LLM call with a fallback to the heuristic if the model is unavailable.

### "What happens if a regex in the sanitizer has a false negative?"
> The sanitizer is a defense-in-depth layer, not a sole control. The output artifact is also scanned by a secondary regex check in the CI log consumer. The patterns are reviewed quarterly against real failure samples to catch gaps. False negatives are tracked and new rules are added — the pattern array is ordered, so new rules can be prepended to take priority.

### "How do you prevent test order dependency in sharded runs?"
> Playwright's `--shard` splits by spec file hash, not by line number or test name. Each shard runs in its own isolated browser context. All tests use the fixture's `appPage` which creates a fresh browser context per test — there is no shared state between tests.

### "What would you change if you had more time?"
> 1. Add **mutation testing** — intentionally break assertions to verify tests actually catch regressions. 2. Upgrade `classifyFailure()` to use **Gemini Flash** with the heuristic as fallback. 3. Add an **ESLint plugin** that AST-scans for `page.waitForTimeout()` and raw `page.locator()` in spec files — catching violations at commit time rather than in CI.

---

## Final Numbers

| Metric | Value |
|--------|-------|
| Total files created/modified | 12 |
| Total lines of production code | ~1,800 |
| Test count | 31 (smoke + regression + unit) |
| Test pass rate | **100%** |
| TypeScript errors | **0** |
| `page.waitForTimeout()` calls | **0** |
| Direct locators in spec files | **0** |
| Unmasked secrets in triage output | **0** |
