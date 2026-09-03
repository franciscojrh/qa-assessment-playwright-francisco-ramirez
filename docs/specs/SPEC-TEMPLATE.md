# Feature Test Contract Specification Template

## Feature Name: [Feature Name, e.g., Dynamic Table Filtering]
- **Target Tier**: Tier 2 (Advanced) / Tier 3 (Master)
- **Author**: [Candidate Name]
- **Date**: [YYYY-MM-DD]
- **Target URL**: [Application URL]

---

## 1. Feature Description & Scope
[Brief description of the feature behavior, target workflows, and user persona.]

---

## 2. Preconditions & Test Data Requirements
- **Authentication State**: [e.g., Guest / Logged in User]
- **Initial Data State**: [e.g., Table populated with 50 server-side records]
- **Mocked Endpoints**: [List any API routes to intercept with page.route()]

---

## 3. Behavioral Scenarios & State Matrix

### Scenario 1: [Scenario Name, e.g., Sort Column Ascending/Descending]
- **Given**: The user is on the target view.
- **When**: The user clicks the column header.
- **Then**: The table re-renders sorted in ascending order.
- **Verification Criteria**:
  - Web-first assertion: Table rows match expected alphabetical/numeric sequence.
  - State check: Active sort indicator attribute is present.

### Scenario 2: [Negative / Boundary Condition Scenario]
- **Given**: [Precondition]
- **When**: [User action / network failure simulation]
- **Then**: [Expected resilient error handling or empty state rendering]

---

## 4. MCP Inspection Plan & Locator Strategy
| Component | Semantic Role / Accessibility Name | Primary Locator Strategy | Fallback / Attribute |
|-----------|-------------------------------------|--------------------------|----------------------|
| Filter Input | `role: 'textbox', name: 'Filter'` | `page.getByLabel('Filter')` | `page.getByRole('textbox')` |
| Table Row | `role: 'row'` | `page.getByRole('row')` | `data-testid='table-row'` |
| Sort Button | `role: 'button', name: 'Sort'` | `page.getByRole('button', { name: 'Sort' })` | - |

---

## 5. Non-Functional Criteria & Quality Gates
- No arbitrary sleep calls (`page.waitForTimeout` is forbidden).
- All network interactions must wait on dynamic responses or web-first assertions.
- 100% type safety with zero TypeScript compilation warnings.
