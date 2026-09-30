---
name: spec-to-e2e-workflow
description: Multi-agent orchestration workflow decomposing feature specifications into robust Playwright Page Objects and auto-waiting test suites.
---

# Multi-Agent Orchestration: Spec-Driven Test Engineering

This skill defines the autonomous 3-agent orchestration pipeline for translating formal behavioral specifications into verified, high-resilience Playwright test automation suites.

## Architecture & Agent Roles

```
   ┌────────────────────────────────┐
   │ 1. Spec Architect Agent        │  Analyzes feature contract & state matrix
   └──────────────┬─────────────────┘
                  │ Contract AST & Invariants
                  ▼
   ┌────────────────────────────────┐
   │ 2. POM Generator Agent         │  Scaffolds BasePage POM with accessibility locators
   └──────────────┬─────────────────┘
                  │ Typed Page Object Model
                  ▼
   ┌────────────────────────────────┐
   │ 3. Assertion Auditor Agent     │  Enforces web-first assertions & auto-waiting rules
   └────────────────────────────────┘
```

---

### Agent 1: Spec Architect
- **Mission**: Ingest feature contracts (`docs/specs/*.md`), extract state transition matrices, and define preconditions, invariants, and edge cases.
- **Output Artifact**: Test plan specifying atomic test scenarios, parameter boundaries, and expected API/route intercepts.

### Agent 2: POM Generator
- **Mission**: Generate or update Page Object classes extending `BasePage`.
- **Enforcement Rules**:
  1. Accessibility-first locator strategy (`getByRole`, `getByLabel`, `getByPlaceholder`, `getByTestId`).
  2. All locators MUST be `private readonly`.
  3. All user interactions wrapped in high-level semantic methods.
  4. ZERO direct locator queries exposed to test specs.

### Agent 3: Assertion Auditor
- **Mission**: Audit generated test suites against strict reliability guidelines.
- **Audit Checklist**:
  - [x] Zero `page.waitForTimeout()` calls anywhere in the diff.
  - [x] All assertions use asynchronous auto-waiting (`await expect(locator).toBeVisible()`).
  - [x] Test specs import exclusively from `@fixtures`.
  - [x] Dynamic network waits and storage state validated deterministically.
