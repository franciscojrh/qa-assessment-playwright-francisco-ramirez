# Sample Practical Challenges: Playwright & MCP Assessment

This document contains pre-defined practical challenge scenarios that facilitators can assign to candidates for Tier 1, Tier 2, and Tier 3 assessments.

---

## Tier 1: Foundational Challenges (60 - 90 Minutes)

### Challenge 1.1: Playwright Documentation Explorer
- **Target URL**: `https://playwright.dev`
- **Objective**: Automate documentation navigation and search workflows using MCP inspection tools.
- **Scenario**:
  1. Navigate to the documentation homepage.
  2. Perform a search for `"Locators"` via the search modal.
  3. Verify that search results populate dynamically and navigate to the Locators documentation page.
  4. Switch the code snippet language tab from `Node.js` to `Python` (or `Java`) and verify that code snippet content updates accordingly.
  5. Toggle Dark/Light mode theme and verify the html root theme attribute updates.
- **Key Deliverables**:
  - `src/pages/playwright-home.page.ts` & `src/pages/docs.page.ts`
  - `src/fixtures/test.fixture.ts`
  - `tests/smoke/playwright-docs.spec.ts` (tagged `@smoke @foundational`)

---

### Challenge 1.2: TodoMVC Core Workflow
- **Target URL**: `https://demo.playwright.dev/todomvc`
- **Objective**: Automate essential CRUD actions on a stateful client application.
- **Scenario**:
  1. Add 3 distinct todo items (`"Buy groceries"`, `"Review PR"`, `"Write Playwright test"`).
  2. Mark the second item as completed.
  3. Filter by `"Active"` and assert that only 2 items appear.
  4. Filter by `"Completed"` and assert that 1 item appears.
  5. Clear completed items and verify the remaining count.
- **Key Deliverables**:
  - `src/pages/todo.page.ts`
  - `src/fixtures/test.fixture.ts`
  - `tests/smoke/todo-crud.spec.ts` (tagged `@smoke @foundational`)

---

## Tier 2: Advanced Challenges (2 - 4 Hours)

### Challenge 2.1: Dynamic E-Commerce Flow with Custom MCP Tool & API Mocking
- **Target URL**: `https://www.saucedemo.com` (or mock eCommerce portal)
- **Objective**: Implement a Spec-Driven test suite with custom MCP tool integration and network interception.
- **Scenario**:
  1. Author a spec contract (`docs/specs/checkout-contract.md`) detailing login, inventory sorting, cart calculation, and checkout validation.
  2. Define a custom MCP tool schema (`src/mcp/inventory-tool.json` / `src/mcp/inventory-tool.ts`) that accepts product filters and returns expected pricing calculations.
  3. Intercept inventory API routes using `page.route()` to simulate out-of-stock items, price surge updates, and network latency.
  4. Automate end-to-end checkout with dynamic tax and total calculation assertions.
  5. Implement error-handling fallbacks for slow network conditions without using arbitrary sleep delays.
- **Key Deliverables**:
  - `docs/specs/checkout-contract.md`
  - `src/mcp/inventory-tool.json` & implementation
  - `src/pages/inventory.page.ts`, `src/pages/cart.page.ts`, `src/pages/checkout.page.ts`
  - `tests/regression/checkout-flow.spec.ts` (tagged `@regression @advanced`)

---

### Challenge 2.2: Dynamic Data Grid with Multi-Agent Orchestration
- **Target URL**: `https://datatables.net/examples/data_sources/server_side` (or modern data grid demo)
- **Objective**: Implement multi-agent workflows to test dynamic server-side paginated tables with complex search and column sorting.
- **Scenario**:
  1. Use a multi-agent orchestration pattern (Inspector Agent -> POM Generator -> Assertion Auditor).
  2. Automate multi-column sorting (e.g., Office ascending, Age descending).
  3. Verify pagination bounds (Page 1 -> Page 5 -> Last Page) and entry count indicators (`"Showing 1 to 10 of 57 entries"`).
  4. Automate global search with debounced server responses and verify highlighted search tokens.
- **Key Deliverables**:
  - Agent workflow configuration in `.agents/skills/table-automation/`
  - `src/pages/datatable.page.ts` with parameterized cell lookup methods
  - `tests/regression/datatable-sorting.spec.ts` (tagged `@regression @advanced`)

---

### Challenge 2.3: Real Task App — Test Inventory & Seed Adoption (Todoist-class)
- **Target URL**: Facilitator **must** provide a sandbox `BASE_URL` (staging / disposable task-manager environment) and, if login is required, disposable credentials. Do not assign this challenge without that sandbox.  
  Do **not** use personal or production Todoist. Do **not** use `https://demo.playwright.dev/todomvc` (Challenge 1.2).
- **Objective**: Use MCP to learn an unfamiliar product, **generate a prioritized test inventory**, then implement a small green suite on this seed — not a full product regression.
- **Scenario**:
  1. Point the seed at the app: copy `.env.example` → `.env.dev`, set `BASE_URL` (and `E2E_USER` / `E2E_PASSWORD` only if the facilitator issued a sandbox login). Never commit secrets.
  2. Inspect the live UI with Playwright MCP (accessibility tree, unique roles/labels). Identify 1–2 primary views (e.g. inbox / today, task editor).
  3. Author a test inventory in `docs/specs/task-app-coverage.md`:
     - List **8–12** candidate cases covering create, complete, edit, filter/search, and one negative or empty state.
     - Tag each as `@smoke`, `@regression`, or **out of scope** (with a one-line reason: auth wall, billing, third-party widget, etc.).
     - Call out what you will **not** automate in this timebox.
  4. Implement **only** the `@smoke` slice (2–3 tests, max 4):
     - Page Objects in `src/pages/` extending `BasePage` (`src/pages/base.page.ts`).
     - Register every POM in `src/fixtures/test.fixture.ts` (no `new PageObject(page)` in specs).
     - Specs under `tests/smoke/` import `test` / `expect` from `@fixtures`.
  5. If login is required, keep credentials in env; use `{ appPage }` / a dedicated login POM. Do not hardcode passwords. Skip billing, sharing, and integrations.
- **Key Deliverables**:
  - `docs/specs/task-app-coverage.md` (inventory + smoke vs regression vs out-of-scope)
  - `src/pages/` task-app POMs (e.g. `inbox.page.ts`, `task-editor.page.ts`)
  - `src/fixtures/test.fixture.ts` (registered fixtures)
  - `tests/smoke/task-app.spec.ts` (tagged `@smoke @advanced`)
  - PR note: MCP tools used, prompts, and any AI output you rejected
- **Acceptance (facilitator)**:
  - Inventory shows coverage thinking, not a dump of 40 cases
  - Smoke is green: `npm run typecheck` && `npm run test:smoke`
  - Zero locators and zero `new PageObject` in specs
  - Zero secrets in git

---

## Tier 3: Master Challenges (4 - 6 Hours / Half Day)

### Challenge 3.1: Enterprise CI/CD Pipeline with AI Failure Triage & DOM Security Sanitizer
- **Target URL**: Full application suite (Playwright Docs + TodoMVC + API mock endpoints)
- **Objective**: Build a complete, enterprise-grade test automation architecture featuring GitHub Actions CI/CD, automated AI trace failure diagnostics, and DOM security sanitization.
- **Scenario**:
  1. **CI/CD Integration**: Extend the existing `.github/workflows/test-automation.yml` (typecheck + smoke + artifacts). Add multi-browser execution if the brief requires it, richer failure artifacts (HTML report, traces, video), and wire AI triage into CI.
  2. **Automated AI Test Failure Triage Engine**: Author `scripts/ai-triage.ts`. When a test fails in CI, the script parses the failed test metadata, reads error stacks, analyzes DOM snapshots, invokes an LLM to categorize the failure (`[BUG]`, `[FLAKE]`, `[LOCATOR_MISMATCH]`, `[ENV_ERROR]`), and outputs a markdown summary to GitHub Job Summary.
  3. **Security & Data Sanitizer**: Implement `src/utils/security-sanitizer.ts` with unit tests (`tests/unit/sanitizer.spec.ts`). The module scrubs sensitive data (credit cards, PII, email addresses, Bearer tokens) from DOM snapshots and network logs before passing context to AI models.
  4. **Architecture Decision Record**: Author `docs/adr/ADR-001-agentic-test-architecture.md` outlining system topology, token cost projection, reliability SLOs, and security compliance.
- **Key Deliverables**:
  - Updated `.github/workflows/test-automation.yml`
  - `scripts/ai-triage.ts`
  - `src/utils/security-sanitizer.ts` & `tests/unit/sanitizer.spec.ts`
  - `docs/adr/ADR-001-agentic-test-architecture.md`
  - Fully green enterprise test suite with zero flakiness.
