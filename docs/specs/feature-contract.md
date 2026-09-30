# Feature Test Contract Specification: TodoMVC Dynamic State Management

## Feature Name: TodoMVC State Lifecycle & Filter Contract
- **Target Tier**: Tier 2 (Advanced)
- **Author**: Francisco Ramirez
- **Date**: 2026-09-30
- **Target URL**: `https://demo.playwright.dev/todomvc`

---

## 1. Feature Description & Scope
The TodoMVC application provides real-time client-side task management with reactive state transitions, localized client-side persistence (`localStorage`), inline item mutation, dynamic routing via URL hash (`#/active`, `#/completed`), and bulk state actions (Toggle All, Clear Completed).

This contract defines the strict behavioral invariants, data preconditions, interaction workflows, and verification criteria for automated regression testing.

---

## 2. Preconditions & Test Data Requirements
- **Authentication State**: Guest / Client-side stateless session.
- **Initial Data State**: Clean application state with zero pre-existing items (empty `localStorage`).
- **Target Environment**: Local Chromium execution against `https://demo.playwright.dev/todomvc`.
- **Mocking & Route Interception**: Client routing hash changes intercepted and verified; network offline/latency simulations handled via Playwright route interception.

---

## 3. Behavioral Scenarios & State Matrix

| State ID | Initial State | Trigger / User Action | Next State | Expected Invariants |
| :--- | :--- | :--- | :--- | :--- |
| **S0 -> S1** | Empty list | Add item (text: `"T1"`) | 1 Active Item | List count = 1; Counter = `"1 item left"`; Footer visible |
| **S1 -> S2** | 1 Active Item | Double click item label & enter new text | Updated Item Text | New text rendered; original text replaced |
| **S1 -> S3** | 1 Active Item | Check item toggle checkbox | 1 Completed Item | Checkbox checked; class `completed` added; Counter = `"0 items left"` |
| **S3 -> S4** | 1 Completed Item | Click filter `Active` (`#/active`) | Empty filtered view | Item hidden from active view; Counter remains `"0 items left"` |
| **S3 -> S5** | 1 Completed Item | Click filter `Completed` (`#/completed`) | 1 Completed Item | Item visible in completed view; Clear Completed button visible |
| **S5 -> S0** | 1 Completed Item | Click `Clear completed` | Empty list | List is empty; Counter and Footer hidden |
| **S-Bulk** | Multiple Items (Mixed) | Click `Mark all as complete` | All Completed | All items completed; Counter = `"0 items left"` |
| **S-Edge** | Input focused | Submit empty / whitespace string | Unchanged State | No item added; input trimmed and retained |

---

## 4. Detailed Test Scenarios

### Scenario 1: Item Creation & Real-Time Count Tracking
- **Given**: The user opens the TodoMVC application with clean state.
- **When**: The user adds items: `"Implement MCP Tool"`, `"Design POM Class"`, and `"Write Regression Spec"`.
- **Then**:
  - The item list contains exactly 3 items in sequential order.
  - The remaining count displays `"3 items left"`.
  - The main section and footer become visible.

### Scenario 2: Item State Transition & Dynamic Filtering
- **Given**: 3 active items exist in the application.
- **When**: The user marks the second item as completed.
- **Then**:
  - The remaining count updates immediately to `"2 items left"`.
  - Navigating to `#/active` shows exactly 2 active items.
  - Navigating to `#/completed` shows exactly 1 completed item.
  - Navigating to `#/all` displays all 3 items with distinct completion states.

### Scenario 3: Inline Item Modification & Cancellation
- **Given**: An active item exists with title `"Draft Plan"`.
- **When**: The user double-clicks the item title, changes text to `"Execute Plan"`, and presses Enter.
- **Then**: The item title updates to `"Execute Plan"`.
- **When**: The user double-clicks the item title, modifies text, and presses Escape.
- **Then**: The item retains `"Execute Plan"` without modifying the title.

### Scenario 4: Bulk Operations (Toggle All & Clear Completed)
- **Given**: Multiple items with mixed completed states exist.
- **When**: The user activates `Mark all as complete`.
- **Then**: Every item in the list is transitioned to completed, and counter displays `"0 items left"`.
- **When**: The user clicks `Clear completed`.
- **Then**: All items are removed and the footer collapses.

### Scenario 5: Boundary & Negative Conditions
- **Given**: The todo input is active.
- **When**: The user submits an empty string or whitespace-only string (`"   "`).
- **Then**: No item is appended to the list and the input remains ready for input.
- **When**: The user hovers an item and clicks the destroy button.
- **Then**: The item is removed and the count recalculates accurately.

### Scenario 6: LocalStorage State Persistence Across Reloads
- **Given**: 2 items are created with 1 marked completed.
- **When**: The page is reloaded.
- **Then**: Both items and their respective completion states persist identically.

---

## 5. MCP Inspection Plan & Accessibility-First Locator Strategy

| UI Component | Role / Accessible Name | Primary Locator Strategy | Target Attribute / Test ID |
| :--- | :--- | :--- | :--- |
| **New Todo Input** | `textbox` / Placeholder: `"What needs to be done?"` | `page.getByPlaceholder("What needs to be done?")` | `input.new-todo` |
| **Toggle All Checkbox** | `checkbox` / Label: `"Mark all as complete"` | `page.getByLabel("Mark all as complete")` | `input#toggle-all` |
| **Todo Item Row** | `listitem` / Test ID: `"todo-item"` | `page.getByTestId("todo-item")` | `li[data-testid="todo-item"]` |
| **Todo Title** | `text` / Test ID: `"todo-title"` | `item.getByTestId("todo-title")` | `label[data-testid="todo-title"]` |
| **Todo Checkbox** | `checkbox` / Label: `"Toggle Todo"` | `item.getByLabel("Toggle Todo")` | `input.toggle` |
| **Item Delete Button** | `button` / Label: `"Delete"` | `item.getByRole("button", { name: "Delete" })` | `button.destroy` |
| **Todo Edit Input** | `textbox` / Label: `"Edit"` | `item.getByLabel("Edit")` | `input.edit` |
| **Todo Counter** | `text` / Test ID: `"todo-count"` | `page.getByTestId("todo-count")` | `span.todo-count` |
| **Filter All Link** | `link` / Name: `"All"` | `page.getByRole("link", { name: "All" })` | `a[href="#/"]` |
| **Filter Active Link** | `link` / Name: `"Active"` | `page.getByRole("link", { name: "Active" })` | `a[href="#/active"]` |
| **Filter Completed Link**| `link` / Name: `"Completed"`| `page.getByRole("link", { name: "Completed" })` | `a[href="#/completed"]` |
| **Clear Completed Button**| `button` / Name: `"Clear completed"`| `page.getByRole("button", { name: "Clear completed" })` | `button.clear-completed` |

---

## 6. Non-Functional Criteria & Quality Gates
- **Zero Arbitrary Delays**: `page.waitForTimeout()` is strictly prohibited.
- **Web-First Assertions**: Auto-waiting assertions (`toBeVisible`, `toHaveText`, `toHaveCount`, `toBeChecked`).
- **Resilience**: Zero flakiness across 3 consecutive runs in parallel.
- **Type Safety**: Fully typed TypeScript definitions with zero compilation errors.
