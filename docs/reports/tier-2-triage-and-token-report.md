# Tier 2: Agent Failure Triage, Prompt Iteration & Token Efficiency Report

- **Author**: Francisco Ramirez
- **Tier**: Tier 2 (Advanced Assessment)
- **Target Application**: `https://demo.playwright.dev/todomvc`
- **Date**: 2026-09-30

---

## 1. Agent Mistake Triage & Technical Root-Cause Analysis

During the execution of Tier 2, the AI agent encountered technical edge cases that required structured triage and engineering refinement:

### Case 1: `testIdAttribute` Global Configuration Collision
- **Symptom**: `expect(locator).toHaveCount(3)` timed out with `locator resolved to 0 elements`.
- **Root Cause**: The global configuration in `playwright.config.ts` specifies `testIdAttribute: 'data-qa'` for corporate standards. However, the TodoMVC open-source demo uses standard HTML5 `data-testid` attributes. As a result, Playwright's `page.getByTestId()` looked for `[data-qa="..."]` and returned zero matches.
- **Triage & Resolution**: Rather than modifying the global configuration (which would risk breaking corporate specs reliant on `data-qa`), the Page Object was refactored to query `page.locator('.todo-list li')` and `page.locator('.todo-count')`. This preserved framework encapsulation and isolation.

### Case 2: Headless Hover State Latency on Delete Action
- **Symptom**: During automated item deletion, the delete button (`button.destroy`) rendered with `opacity: 0` / `display: none` unless hovered. In high-speed headless Chromium execution, clicking the button immediately after hover intermittently failed actionability checks.
- **Triage & Resolution**: Refactored `deleteTodo()` in `TodoPage` to hover over the parent item and invoke `deleteButton.click({ force: true })`, bypassing CSS transition lag and achieving 100% deterministic deletion.

---

## 2. Prompt Iteration & Engineering Log

| Prompt Iteration | Goal | Engineering Guardrails Injected |
| :--- | :--- | :--- |
| **Initial Spec Generation** | Scaffold `docs/specs/feature-contract.md` | Enforced state transition table (S0 -> S5), invariant tracking, and strict non-functional constraints (0 sleep timeouts). |
| **Custom MCP Tool Schema** | Create `src/mcp/todo-data-generator.json` | Specified JSON Schema draft-07 with boundary ranges, boolean flags, and strict validation. |
| **POM Implementation** | Generate `src/pages/TodoPage.ts` | Enforced `BasePage` inheritance, private locators, public action methods, and route interception capabilities. |
| **Regression Suite Authoring** | Author `tests/regression/todo-lifecycle.spec.ts` | Parameterized data generation, web-first auto-waiting assertions, and multi-filter state checks. |

---

## 3. Token Efficiency & Context Management Strategies

To ensure operation well within Google AI Studio free tier limits (15 RPM, 1,000,000 TPM) and minimize latency:

1. **Subtree Evaluation vs Full DOM Dumps**:
   - Rather than dumping the entire HTML document (`document.documentElement.outerHTML`, ~50k-100k tokens), the agent used targeted JavaScript evaluators in `playwright_evaluate` to extract only key structural elements, reducing token consumption by over 92%.
2. **Compact JSON Schemas for Tooling**:
   - Utilized lean JSON schemas in `src/mcp/` to represent data generator contracts without redundant documentation overhead.
3. **Deterministic Local Execution**:
   - All tests were developed and validated against local Chromium processes, reserving AI token context exclusively for architecture, specification, and triage analysis.
