# Facilitator & Evaluator Guide: Playwright & MCP Assessment

## 1. Overview & Evaluator Responsibilities

This guide provides interviewers, engineering managers, and technical evaluators with a standardized framework for administering, scoring, and defending the **Playwright & Model Context Protocol (MCP)** QA Assessment.

### Core Objectives for Evaluators
- Maintain consistency and objective scoring across all candidate cohorts.
- Evaluate the candidate's engineering judgment and AI orchestration capabilities rather than passive code typing speed.
- Detect hallucinations, anti-patterns, and fragile implementations during the technical defense walkthrough.
- Provide actionable, quantitative feedback grounded in the [Evaluation Rubric](../RUBRIC.md).

---

## 2. Assessment Administration Workflow

### Phase 1: Pre-Assessment Briefing (10 mins)
1. Verify candidate has provisioned their new repository, granted collaborator access to the evaluation team, executed `npm install`, and configured their local MCP client.
2. Assign the candidate their specific **Assessment Tier** (Tier 1, Tier 2, or Tier 3) and **Challenge Brief** from [SAMPLE_CHALLENGES.md](./SAMPLE_CHALLENGES.md).
3. Confirm timebox boundaries (Tier 1: 60-90 min, Tier 2: 2-4 hrs, Tier 3: ~Half day).
4. Review the "Allowed / Prohibited" rules from [ASSESSMENT_BRIEF.md](../ASSESSMENT_BRIEF.md).

### Phase 2: Live Observation / Async Delivery
- If live: Observe candidate's prompt iterations, MCP tool invocations, and debugging flow.
- If async: Candidate submits Pull Request within the allocated time window with PR description and execution logs.

### Phase 3: Technical Defense Walkthrough (20 - 30 mins)
- 00:00 - 08:00: Candidate architectural walkthrough (POM, fixtures, tool calls).
- 08:00 - 16:00: Live failure injection / interactive debugging exercise.
- 16:00 - 25:00: Structured oral defense questions from Question Bank.
- 25:00 - 30:00: Final scoring and internal deliberation.

---

## 3. Live Failure Injection Scenarios (Pick One for Defense)

During the technical defense, the evaluator should ask the candidate to introduce or debug a simulated failure in real time to assess their reactive AI debugging workflow.

### Scenario A: Locator Breakage & Resilient Refactoring (Tier 1 & Tier 2)
- **Action**: Evaluator asks candidate: *"The product team just updated the navigation search button role to a generic `div` with `aria-label='Find documentation'`. How do you prompt your agent using MCP to inspect the live change and update your POM without breaking other tests?"*
- **What to look for**:
  - Candidate uses MCP inspection tools to check the modified DOM rather than guessing.
  - Updates only the POM locator, leaving spec files untouched.
  - Avoids brittle CSS fallback.

### Scenario B: Asynchronous State & Network Race Condition (Tier 2 & Tier 3)
- **Action**: Evaluator asks candidate: *"Under 3G throttling or delayed backend responses, the item count assertion fails intermittently. How do you instruct your agent to eliminate the race condition without using `waitForTimeout`?"*
- **What to look for**:
  - Candidate leverages web-first assertions (`await expect(locator).toHaveCount(n)`).
  - Uses `page.waitForResponse()` or network idle listeners if dynamic API calls are involved.
  - Refuses to insert arbitrary sleep timeouts.

### Scenario C: Hallucination Detection (All Tiers)
- **Action**: Evaluator asks candidate: *"The agent suggested using `await page.clickWhenReady('#submit-btn')`. How do you identify this error, explain why it failed, and correct the agent?"*
- **What to look for**:
  - Candidate immediately recognizes non-existent Playwright API.
  - Understands Playwright's built-in auto-waiting on `click()`.
  - Replaces it with `await page.getByRole('button', { name: 'Submit' }).click()`.

---

## 4. Oral Defense Question Bank (Categorized by Rubric)

### Category A: Agentic Architecture & Design

1. **(A.2 - MCP Understanding)**:
   - *"Can you explain the difference between how an AI agent interacts with a browser via MCP versus a traditional Playwright script running in Node.js?"*
   - *Expected Answer*: MCP operates as a client-server protocol (JSON-RPC) allowing the LLM to invoke tool functions (e.g. `inspect_dom`, `click_element`) hosted by an MCP server to read state and take actions dynamically during inference, whereas a static Playwright script runs predetermined imperative code.

2. **(A.3 - Sub-Agents & Skills)**:
   - *"When would you decompose a testing problem into multiple sub-agents versus using a single long-context prompt?"*
   - *Expected Answer*: Decompose when tasks have distinct cognitive requirements (e.g., visual inspection vs. typed code generation vs. failure triage), when context windows would become polluted with noisy HTML data, or to implement a generator-critic feedback loop.

3. **(A.7 - Function Calling & Schemas)**:
   - *"What are the critical components of an MCP tool schema to ensure an AI model calls it with valid parameters?"*
   - *Expected Answer*: Strict JSON Schema definitions, explicit type constraints, enumerated values for constrained options, clear natural-language property descriptions, and mandatory required field arrays.

---

### Category B: AI Integrations

1. **(B.4 - System Prompt Design)**:
   - *"What constraints did you include in your agent instructions to prevent the model from hardcoding selectors inside test spec files?"*
   - *Expected Answer*: Explicit negative constraints (e.g., "NEVER use page.locator in spec files"), architectural requirements ("Encapsulate all locators as private properties in POM classes in src/pages/"), and few-shot examples demonstrating correct fixture usage.

2. **(B.5 - Error Handling & Fallbacks)**:
   - *"If an MCP server or LLM API endpoint times out or returns malformed JSON during a test triage run, how does your architecture prevent test execution failure?"*
   - *Expected Answer*: Implementation of try-catch boundaries, retry policies with backoff, JSON sanitization/repair utilities, and deterministic fallback heuristics that allow test suites to proceed even if AI services are temporarily unavailable.

3. **(B.7 - Data Governance & Security)**:
   - *"What security risks exist when letting AI agents inspect internal enterprise web applications, and how did you mitigate them?"*
   - *Expected Answer*: Risks include leaking PII/credentials in LLM prompts, session token exfiltration, and prompt injection attacks via malicious web page content. Mitigation requires DOM sanitization layers, PII masking, stripping auth headers, and zero-data-retention model endpoints.

---

### Category C: AI Builder

1. **(C.2 - Token Efficiency)**:
   - *"How did you minimize token usage when inspecting web pages with dense DOM structures?"*
   - *Expected Answer*: Requesting simplified accessibility trees or scoped element subtrees rather than dumping raw HTML source trees; pruning chat histories; avoiding repetitive full-page dumps in iterative loops.

2. **(C.4 - Spec-Driven Development)**:
   - *"Why is Spec-Driven Development especially critical when generating automated tests with AI agents?"*
   - *Expected Answer*: AI models require clear ground-truth contracts (acceptance criteria, input/output schemas) to prevent generating tests that pass trivially by asserting on incorrect or incomplete behavior (assertion illusion).

3. **(C.6 - Output Review & Verification)**:
   - *"What subtle anti-patterns or bugs have you seen AI models introduce in Playwright code that TypeScript compilers might not catch?"*
   - *Expected Answer*: Unawaited assertions (e.g., `expect(locator.isVisible())` which always evaluates truthy because a Promise is truthy), missing `await` on action methods, using generic timeouts, or asserting on non-unique locators.

---

## 5. Candidate Evaluation Scoring Sheet Template

```markdown
# Candidate Assessment Evaluation Sheet

- **Candidate Name**: __________________________
- **Date of Assessment**: __________________________
- **Assigned Tier**: [ ] Tier 1   [ ] Tier 2   [ ] Tier 3
- **Evaluator Name(s)**: __________________________

---

### Quantitative Scoring Matrix (Scale 1 - 5)

#### Category A: Agentic Architecture & Design
| Competency | Score (1-5) | Notes & Observed Evidence |
|------------|-------------|----------------------------|
| A.1 Coding Agent Utilization | | |
| A.2 MCP Understanding | | |
| A.3 Skills / Sub-agents | | |
| A.4 Task Decomposition | | |
| A.5 Multi-agent Workflows (Tier 2/3) | | |
| A.6 Context & Memory Management (Tier 2/3) | | |
| A.7 Tool Schema Definition (Tier 2/3) | | |
| **Category A Subtotal / Average**: | | |

#### Category B: AI Integrations
| Competency | Score (1-5) | Notes & Observed Evidence |
|------------|-------------|----------------------------|
| B.1 System / API Connectivity | | |
| B.2 RAG Pipelines (Tier 2/3) | | |
| B.3 Embeddings & Vector Search (Tier 2/3) | | |
| B.4 System Prompt Design | | |
| B.5 Error Handling & Fallbacks (Tier 2/3) | | |
| B.6 CI/CD Pipeline Integration (Tier 3) | | |
| B.7 Security & Governance (Tier 3) | | |
| **Category B Subtotal / Average**: | | |

#### Category C: AI Builder
| Competency | Score (1-5) | Notes & Observed Evidence |
|------------|-------------|----------------------------|
| C.1 Development Cycle Acceleration | | |
| C.2 Token Efficiency | | |
| C.3 Prompt Refinement & Iteration | | |
| C.4 Spec-Driven Development (Tier 2/3) | | |
| C.5 Test & Validation of AI Code (Tier 2/3) | | |
| C.6 Review for Correctness & Security (Tier 2/3) | | |
| C.7 Operational & Production Judgment (Tier 3) | | |
| **Category C Subtotal / Average**: | | |

---

### Disqualifier Checklist
- [ ] No hardcoded locators in spec files? (Pass / Fail)
- [ ] Zero arbitrary timeouts (`page.waitForTimeout`)? (Pass / Fail)
- [ ] Zero hardcoded secrets / credentials? (Pass / Fail)
- [ ] TypeScript compilation green with zero errors? (Pass / Fail)
- [ ] Test suite passes cleanly without unhandled rejections? (Pass / Fail)

---

### Final Evaluation Decision
- [ ] **Pass Tier 1 (Foundational Qualification)**
- [ ] **Pass Tier 2 (Advanced Qualification)**
- [ ] **Pass Tier 3 (Master Certification)**
- [ ] **Needs Re-assessment / Unsatisfactory**

**Key Evaluator Summary & Recommendations**:
__________________________________________________________________________________________
__________________________________________________________________________________________
```
