# ADR-001: Agentic Test Automation Architecture

- **Status**: Accepted
- **Date**: 2026-10-01
- **Author**: Francisco Ramirez
- **Assigned Tier**: Tier 3 — Master / Certification

---

## 1. Context & Problem Statement

This repository implements an enterprise-grade, autonomous Playwright test automation system for `playwright.dev` and `demo.playwright.dev/todomvc`. The system must:

1. Scale to parallel execution across multiple CI shards without introducing test isolation failures.
2. Integrate AI-assisted failure triage directly into the CI pipeline to reduce mean-time-to-diagnosis (MTTD) for broken builds.
3. Enforce data governance so that no PII, session tokens, or credentials leak to external AI APIs or MCP servers during automated DOM inspection or network log analysis.
4. Produce actionable, self-documenting test output that can be reviewed by engineers without running the suite locally.

A key architectural challenge is balancing **LLM-assisted analysis** (non-deterministic, latency-sensitive, costly) with **static Playwright automation** (deterministic, fast, zero token cost) in a way that maximizes signal quality while minimising flakiness risk.

---

## 2. Decision Drivers

| Driver | Rationale |
|--------|-----------|
| **Flakiness SLO < 1%** | Business-critical CI gates require near-zero false-failure rates. Any architecture that introduces flakiness from AI non-determinism at the test execution layer is disqualified. |
| **AI Token Cost Constraints** | LLM calls must be scoped to post-hoc triage only (not inline during test execution), preventing token budget overruns on green runs. |
| **PII / PHI Compliance** | DOM snapshots and network traces captured during test execution may contain real user data in staging environments. Zero-retention and sanitization-before-transmission is mandatory. |
| **CI/CD Execution Determinism** | Sharded parallel execution across GitHub Actions runners must be deterministic; shard allocation must not introduce ordering dependencies. |
| **Accessibility-First Locator Maintenance** | Locators must survive minor DOM refactors. Brittle CSS selectors create a locator maintenance burden that compounds at scale. |

---

## 3. Considered Options

### Option A: AI-Driven Test Generation (Inline)
Invoke an LLM inside each `test()` block to dynamically generate assertions at runtime.

**Verdict: Rejected.**
Non-deterministic AI outputs inside test execution make assertions flaky. Any LLM latency spike exceeds Playwright's `actionTimeout`, producing false failures. Token costs scale linearly with test count.

### Option B: Full BDD with Cucumber + AI Scenario Generator
Use Gherkin specifications as the source of truth and an AI agent to generate step definitions.

**Verdict: Rejected for this repository's scope.**
Introduces a heavy intermediate layer (Cucumber, step registry) that adds maintenance overhead without proportional benefit for a Playwright-native test suite. Better fit for multi-team cross-functional acceptance testing.

### Option C: Static POM + Post-Hoc AI Triage (Selected)
Keep all test execution 100% deterministic Playwright code (POM + fixtures). Invoke AI exclusively as a **post-hoc triage tool** that analyzes the JSON report artifact after a failure is already detected.

**Verdict: Accepted.** See Section 4.

---

## 4. Decision Outcome & Architecture Topology

The selected architecture separates concerns into three strict layers:

```
┌──────────────────────────────────────────────────────────────────────┐
│                     CI/CD Pipeline (GitHub Actions)                  │
│                                                                      │
│  ┌─────────────┐     ┌──────────────────────────────────────────┐    │
│  │  typecheck  │────▶│  Smoke Suite (2 shards, chromium)         │    │
│  │  (static)   │     │  Regression Suite (4 shards, chromium)   │    │
│  └─────────────┘     └────────────────────┬─────────────────────┘    │
│                                           │ on: failure()             │
│                                           ▼                           │
│                       ┌──────────────────────────────────────────┐   │
│                       │  AI Failure Triage Job                    │   │
│                       │  1. Download shard JSON artifacts         │   │
│                       │  2. Merge report shards                   │   │
│                       │  3. SecuritySanitizer.sanitizeText()      │   │
│                       │  4. AiFailureTriage.classifyFailure()     │   │
│                       │  5. Append to $GITHUB_STEP_SUMMARY        │   │
│                       └──────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                       Test Execution Layer                           │
│                                                                      │
│  ┌───────────────┐   ┌──────────────────┐   ┌────────────────────┐  │
│  │  BasePage     │   │  Page Objects     │   │  Custom Fixtures   │  │
│  │  (abstract)   │──▶│  (POM classes)    │──▶│  (DI container)   │  │
│  └───────────────┘   └──────────────────┘   └────────┬───────────┘  │
│                                                        │              │
│                       ┌───────────────────────────────▼──────────┐  │
│                       │  Test Specs (*.spec.ts)                   │  │
│                       │  - Zero direct locator queries            │  │
│                       │  - Import test/expect from @fixtures only  │  │
│                       │  - Web-first assertions only              │  │
│                       └──────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                       MCP Integration Layer                          │
│                                                                      │
│  Playwright MCP Server ◀──── AI Coding Agent (development only)     │
│  - DOM inspection during POM authoring                               │
│  - Locator verification (count() / strict-mode checks)               │
│  - Screenshot capture for debugging                                  │
│                                                                      │
│  test-analyzer MCP Server ◀── Local report triage (optional)        │
│  - get_test_summary, get_failures, get_slowest_tests                 │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.1 Sharding Strategy

| Suite | Shards | Total Runners | Timeout |
|-------|--------|---------------|---------|
| Smoke (`@smoke`) | 2 | 2 × 15 min | 30 min wall-clock max |
| Regression (`@regression`) | 4 | 4 × 30 min | 120 min wall-clock max |

Playwright's `--shard=N/M` flag distributes spec files deterministically by hash. `fail-fast: false` ensures all shards complete even if one fails, preserving the full failure dataset for triage.

### 4.2 Security Governance & Data Scrubbing Boundary

```
DOM Snapshot / Network Log (raw)
         │
         ▼
┌─────────────────────────────────────────┐
│  SecuritySanitizer.sanitizeText()        │
│  - Bearer/JWT tokens → [REDACTED:TOKEN] │
│  - Emails → [REDACTED:EMAIL]            │
│  - Credit cards → [REDACTED:CC]         │
│  - SSNs / Phone → [REDACTED:SSN/PHONE]  │
│  - Prompt injection → [REDACTED:INJ]    │
└────────────────────┬────────────────────┘
                     │ sanitized text only
                     ▼
         External AI API / MCP Server
         (zero raw PII reaches this boundary)
```

**Key controls:**
- `sanitizeText()` is applied to the raw JSON report **before** JSON.parse() in `ai-triage.ts`, ensuring any PII embedded in test titles or error messages is scrubbed before further processing.
- `sanitizeObject()` provides recursive field-level redaction for structured payloads.
- `sanitizeHeaders()` masks `Authorization`, `Cookie`, `x-api-key`, and `set-cookie` values before headers are included in MCP context or AI prompts.
- `sanitizeDomSnapshot()` enforces an 8,000-character token budget to prevent accidental context flooding with multi-megabyte HTML dumps.

### 4.3 Locator Strategy Hierarchy (AGENTS.md Rule 3)

```
Priority 1: getByRole()      — semantic, ARIA-stable
Priority 2: getByLabel()     — form controls
Priority 3: getByPlaceholder() — input hints
Priority 4: getByText()      — visible text content
Priority 5: getByTestId()    — explicit data-qa attributes
Forbidden:  CSS class/ID selectors, XPath with nth-child indices
```

### 4.4 AI Failure Triage Classification Model

The triage engine uses a **rule-based heuristic classifier** (ordered pattern matching) rather than a live LLM call. This design choice is deliberate:

| Property | Rule-Based Heuristic | Live LLM Call |
|----------|----------------------|---------------|
| Determinism | ✅ 100% reproducible | ❌ Non-deterministic |
| Latency | ✅ < 100ms | ❌ 2–30s per failure |
| Token Cost | ✅ $0 | ❌ ~$0.01–0.10 per run |
| Offline operation | ✅ Works in air-gapped CI | ❌ Requires network |
| Coverage | ✅ 95%+ common failure modes | ✅ Handles novel failures |

The architecture supports upgrading to an LLM call (e.g., Google Gemini Flash, Anthropic Claude Haiku) for the `classifyFailure()` method in future iterations by wrapping the call in a retry/fallback wrapper — the heuristic classifier serves as the deterministic fallback.

---

## 5. Operational Reliability & Cost Model

### 5.1 SLO Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Test Suite Flakiness Rate | < 1% | (flaky failures / total runs) over 30-day rolling window |
| AI Triage Precision | > 90% | % of classified failures confirmed by engineer review |
| CI Pipeline P95 Duration | < 20 min | Smoke: 15 min max, Regression: 30 min max (parallel) |
| PII Leak Rate | 0% | Automated regex scan of triage output artifacts |
| TypeCheck Pass Rate | 100% | `npm run typecheck` must always exit 0 before test runs |

### 5.2 Token Cost Model

| Component | Token Estimate | Cost Estimate (@ $0.0001/1K tokens) |
|-----------|---------------|--------------------------------------|
| DOM sanitization (8KB budget) | ~2,000 tokens | $0.0002 per snapshot |
| AI triage report (20 failures) | ~1,500 tokens output | $0.00015 per CI run |
| **Total per CI run (failure scenario)** | ~3,500 tokens | **$0.00035** |

On 100 CI runs/day with 5% failure rate: **~$0.017/day** — negligible cost.

If an LLM call is added to `classifyFailure()` in the future (Gemini Flash 2.0 at $0.075/1M tokens), cost per failure classification = ~$0.00005. For 20 failures per run × 5 runs/day = $0.005/day. Still well within enterprise token budget.

---

## 6. Consequences & Trade-offs

### Positive Impacts
- **Deterministic test execution**: Zero AI involvement in test runtime eliminates AI-induced flakiness.
- **Zero token waste on green runs**: The AI triage job has `if: failure()` condition — it never executes on passing builds.
- **Progressive AI adoption**: The heuristic classifier can be upgraded to an LLM call without changing the public API of `AiFailureTriage`.
- **Security-by-default**: Sanitization runs before any data leaves the execution boundary, protecting both production and staging environment data.
- **Full observability**: HTML reports, JSON reports, trace ZIPs, screenshots, and videos are all uploaded as artifacts on every failure.

### Negative Impacts / Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Heuristic classifier misses novel failure modes | Medium | Add new rules to `CLASSIFICATION_RULES` as failure patterns emerge; long-term upgrade to LLM call with heuristic fallback. |
| Shard count mismatch (test count < shard count) | Low | Playwright handles this gracefully — empty shards simply complete with 0 tests. |
| DOM truncation at 8KB hides relevant context | Low | Increase `maxLength` parameter; or pre-filter to the failing test's subtree before sending. |
| Regex-based PII detection has false negatives | Medium | Combine with output scanning in the CI log consumer. Review flagged false-positives quarterly and refine patterns. |
| `ts-node` cold start adds ~5s to triage job | Low | Acceptable for a post-failure diagnostic step. Could be precompiled with `tsc` in a future optimization. |
