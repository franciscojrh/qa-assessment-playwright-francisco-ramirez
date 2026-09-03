# Playwright & Model Context Protocol (MCP) QA Assessment Framework

## 1. Overview

This repository is a standardized, universal assessment framework to evaluate Quality Assurance (QA) and Software Development Engineers in Test (SDET) on **Playwright** test automation and **Model Context Protocol (MCP)** agentic workflows.

Candidates are assessed on practical judgment, architectural discipline, robust automation patterns, and effective human-AI collaboration. The goal is not manual code typing, but orchestrating AI coding agents, leveraging MCP tools for deterministic browser inspection, maintaining strict quality standards, and validating generated code for production readiness.

---

## 2. Universal Candidate Deliverables & Submission Protocol

Every candidate must deliver a standardized, self-contained set of artifacts. The evaluation is conducted on a **new repository created by the candidate**, where access is granted to the evaluation team.

```
+---------------------------------------------------------------------------------------------------+
|                                  CANDIDATE SUBMISSION WORKFLOW                                    |
+---------------------------------------------------------------------------------------------------+
|                                                                                                   |
|   1. Create New Repository from Template                                                          |
|      - Create a new repository on GitHub (private or public per cohort instructions).             |
|      - Clone the repository locally and verify baseline dependencies.                             |
|                                                                                                   |
|   2. Grant Access to Evaluation Team                                                              |
|      - Navigate to GitHub Repository > Settings > Collaborators > Add People.                     |
|      - Invite the designated evaluator GitHub handles / team emails before starting.              |
|                                                                                                   |
|   3. Create Feature Branch                                                                        |
|      - Create working branch: `git checkout -b submission/<candidate-name>`                       |
|                                                                                                   |
|   4. Complete Assigned Practical Challenge                                                        |
|      - Implement POM classes, custom fixtures, spec files, and tier-specific artifacts.           |
|                                                                                                   |
|   5. Validate Quality Gates Locally                                                               |
|      - Run `npm run typecheck && npm run test:smoke` (all checks must be 100% green).             |
|                                                                                                   |
|   6. Submit Pull Request & Share Links                                                            |
|      - Open Pull Request from `submission/<candidate-name>` into `main`.                          |
|      - Complete the standardized PR template with tool execution logs.                            |
|      - Provide Repository URL and Pull Request URL to the evaluation committee.                   |
|                                                                                                   |
+---------------------------------------------------------------------------------------------------+
```

### Universal Deliverables Matrix

| Artifact | Location | Description | Applicable Tiers |
|----------|----------|-------------|------------------|
| **Page Object Models** | `src/pages/*.page.ts` | Typed Page Object classes encapsulating private locators (`getByRole`, `getByLabel`, `getByTestId`) and public user actions. | All Tiers (1, 2, 3) |
| **Custom Fixtures** | `src/fixtures/test.fixture.ts` | Extended Playwright fixtures providing dependency injection for Page Objects into test contexts. | All Tiers (1, 2, 3) |
| **Test Spec Files** | `tests/smoke/` & `tests/regression/` | Spec files importing exclusively from `@fixtures` with web-first assertions and descriptive tags (`@smoke`, `@regression`). Zero direct locators. | All Tiers (1, 2, 3) |
| **Pull Request Submission** | GitHub Pull Request | Detailed PR containing summary of changes, MCP tool invocation log, prompt iteration history, and validation evidence. | All Tiers (1, 2, 3) |
| **Feature Contract Spec** | `docs/specs/*.md` | Typed behavioral specification following Spec-Driven Development principles. | Tier 2 & Tier 3 |
| **Custom MCP Schema / Skill** | `src/mcp/` or `.agents/` | JSON-RPC tool schema definition or sub-agent orchestration workflow. | Tier 2 & Tier 3 |
| **CI/CD Pipeline & AI Triage** | `.github/workflows/` & `scripts/` | GitHub Actions workflow and automated failure triage diagnostic script. | Tier 3 |
| **Security Sanitizer** | `src/utils/security-sanitizer.ts` | PII and credential redaction module for AI prompt governance. | Tier 3 |
| **Architecture Decision Record**| `docs/adr/*.md` | Structured ADR documenting architectural topology, SLOs, and cost trade-offs. | Tier 3 |

---

## 3. Assessment Tiers & Timeboxes

| Tier | Level | Target Timebox | Core Scope | Minimum Score Threshold |
|------|-------|----------------|------------|-------------------------|
| **Tier 1** | Foundational | 60 - 90 minutes | MCP DOM inspection, Page Object generation, custom fixtures, token efficiency, smoke validation. | 80% (36 / 45 pts) |
| **Tier 2** | Advanced | 2 - 4 hours | Spec-Driven Development, custom MCP tool schema / sub-agents, dynamic state handling, API mocking. | 85% (72 / 85 pts) |
| **Tier 3** | Master / Certification | 4 - 6 hours (Half Day) | Enterprise CI/CD pipeline, AI failure triage & trace analyzer, DOM security sanitization, ADR. | 90% (95 / 105 pts) |

Facilitator scoring criteria are defined in [RUBRIC.md](RUBRIC.md).

---

## 4. Step-by-Step Deliverable Walkthrough (Illustrative Reference)

The following walkthrough illustrates how any candidate completes an assessment scenario using an AI agent with MCP integration:

### Step 1: Receiving Scenario & Branch Creation
Create your feature branch:
```bash
git checkout -b submission/jane-doe-assessment
```

### Step 2: Live DOM Inspection via MCP
Direct your AI coding assistant to use the configured Playwright MCP server to inspect the target application:

**Example Agent Prompt**:
```text
Navigate to the target portal using the Playwright MCP server. Inspect the login form and header navigation bar. Extract the semantic accessibility roles (roles, labels, placeholders) for the username input, password input, submit button, and settings menu link.
```

**Observed MCP Interaction**:
```json
{
  "tool": "playwright_inspect_dom",
  "parameters": {
    "url": "https://example.app/login",
    "selector": "form.login-box"
  },
  "result": {
    "accessibility_tree": [
      { "role": "textbox", "name": "Username" },
      { "role": "textbox", "name": "Password", "type": "password" },
      { "role": "button", "name": "Sign In" }
    ]
  }
}
```

### Step 3: Authoring the Page Object Model
Create a typed Page Object in `src/pages/` encapsulating locators as private properties:

```typescript
// src/pages/auth.page.ts
import { type Page, type Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AuthPage extends BasePage {
  private readonly usernameInput: Locator;
  private readonly passwordInput: Locator;
  private readonly signInButton: Locator;
  private readonly userGreeting: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByLabel('Username');
    this.passwordInput = page.getByLabel('Password');
    this.signInButton = page.getByRole('button', { name: 'Sign In' });
    this.userGreeting = page.getByRole('heading', { level: 2 });
  }

  async login(user: string, pass: string): Promise<void> {
    await this.usernameInput.fill(user);
    await this.passwordInput.fill(pass);
    await this.signInButton.click();
  }

  async verifyLoggedIn(expectedUser: string): Promise<void> {
    await expect(this.userGreeting).toContainText(expectedUser);
  }
}
```

### Step 4: Registering the Custom Fixture
Register the Page Object in `src/fixtures/test.fixture.ts`:

```typescript
// src/fixtures/test.fixture.ts
import { test as baseTest, expect } from '@playwright/test';
import { AuthPage } from '../pages/auth.page';

export type CustomFixtures = {
  authPage: AuthPage;
};

export const test = baseTest.extend<CustomFixtures>({
  authPage: async ({ page }, use) => {
    const authPage = new AuthPage(page);
    await use(authPage);
  },
});

export { expect };
```

### Step 5: Authoring the Test Spec
Author the spec in `tests/smoke/auth.spec.ts` without direct locator queries:

```typescript
// tests/smoke/auth.spec.ts
import { test, expect } from '../../src/fixtures/test.fixture';

test.describe('Authentication & Dashboard Flow @smoke @foundational', () => {
  test('should successfully sign in with valid credentials', async ({ authPage, page }) => {
    await page.goto('/login');
    await authPage.login('standard_user', 'secret_pass');
    await authPage.verifyLoggedIn('standard_user');
  });
});
```

### Step 6: Validating Quality Gates Locally
```bash
npm run typecheck
npm run test:smoke
```

### Step 7: Opening Pull Request & Submitting
Open the Pull Request against `main`, fill out the PR description template with tool logs, and provide the repo and PR URLs to the evaluation team.

---

## 5. Repository Structure

```text
.
├── ASSESSMENT_BRIEF.md         # Comprehensive candidate instructions and tier challenges
├── RUBRIC.md                   # Full evaluation matrix with scoring criteria and weights
├── AGENTS.md                   # System rules, coding standards, POM conventions, and MCP constraints
├── docs/
│   ├── GETTING_STARTED.md      # Environment setup, Playwright config, and MCP server connectivity
│   ├── FACILITATOR_GUIDE.md    # Evaluator instructions, oral defense question bank, and scoring sheets
│   ├── SAMPLE_CHALLENGES.md    # Pre-built practical challenge scenarios for each tier
│   ├── specs/
│   │   └── SPEC-TEMPLATE.md    # Feature contract specification template (Tier 2/3)
│   └── adr/
│       └── ADR-TEMPLATE.md     # Architecture Decision Record template (Tier 3)
├── src/
│   ├── fixtures/
│   │   └── test.fixture.ts     # Central custom fixtures extending test & expect
│   ├── pages/
│   │   ├── base.page.ts        # Abstract base page object
│   │   └── *.page.ts           # Candidate-authored Page Object Models
│   ├── utils/
│   │   └── security-sanitizer.ts # Security & PII sanitizer module (Tier 3)
│   └── mcp/
│       └── example-tool-schema.json # Custom MCP tool schema template (Tier 2/3)
├── tests/
│   ├── smoke/
│   │   └── sample.spec.ts      # Smoke test specs (@smoke)
│   └── regression/             # Comprehensive regression test specs (@regression)
├── scripts/
│   └── ai-triage.ts            # AI diagnostic & failure triage script (Tier 3)
├── .github/
│   └── workflows/
│       └── test-automation.yml # CI/CD execution & triage workflow (Tier 3)
├── playwright.config.ts        # Playwright runner configuration
├── package.json                # Dependencies and scripts
└── tsconfig.json               # Strict TypeScript compiler options
```

---

## 6. Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Install Playwright browser binaries:
   ```bash
   npx playwright install --with-deps chromium
   ```
3. Configure your local MCP server following [docs/GETTING_STARTED.md](docs/GETTING_STARTED.md).
4. Run baseline healthcheck:
   ```bash
   npm run typecheck && npm run test:smoke
   ```

---

## 7. Non-Negotiable Engineering Rules

- **Zero Direct Locators in Specs**: `page.locator()` or `page.$()` inside `tests/**/*.spec.ts` is strictly prohibited. All locators must be private in POM classes.
- **Dependency Injection**: Never instantiate Page Objects with `new MyPage(page)` inside spec files. Consume from `@fixtures`.
- **Zero Arbitrary Timeouts**: `page.waitForTimeout()` is strictly forbidden. Use auto-waiting web-first assertions (`await expect(...)`).
- **No Hallucinations**: Every Playwright API call must be valid, verified, and correctly awaited.
- **Zero Secret Commits**: Never commit `.env` files, API keys, or credentials.
