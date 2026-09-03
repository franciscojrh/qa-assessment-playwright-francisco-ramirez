# QA Engineering Evaluation Rubric: Playwright & MCP

## 1. Executive Summary

This rubric establishes a standardized evaluation system for QA and SDET professionals utilizing **Playwright** alongside the **Model Context Protocol (MCP)** and modern AI coding agents. 

The evaluation framework is structured across three core categories and three mastery tiers:
- **Tier 1 - Foundational**: Candidate uses AI coding agents and MCP tools to inspect web interfaces, plan basic execution steps, generate structured Page Object Models, and maintain test stability.
- **Tier 2 - Advanced**: Candidate designs multi-agent workflows, defines custom MCP tool schemas, implements spec-driven development, manages token context and memory, and enforces robust error-handling/fallback patterns.
- **Tier 3 - Master (Certification)**: Candidate integrates AI agentic pipelines into CI/CD systems, enforces data governance/security boundaries, builds self-healing test architectures, and makes operational/architectural decisions for enterprise test automation.

---

## 2. Evaluation Matrix Overview

| Category | Competency | Tier 1: Foundational | Tier 2: Advanced | Tier 3: Master (Certification) |
| :--- | :--- | :---: | :---: | :---: |
| **Agentic Architecture / Agentic Design** | Uses coding agents effectively | Yes | Yes | Yes |
| | Understands MCPs (Model Context Protocol) | Yes | Yes | Yes |
| | Builds and uses Skills / sub-agents | Yes | Yes | Yes |
| | Plans multi-step execution and task decomposition | Yes | Yes | Yes |
| | Designs multi-agent orchestration workflows | - | Yes | Yes |
| | Manages context and memory across agent runs | - | Yes | Yes |
| | Defines tool use / function-calling schemas | - | Yes | Yes |
| **AI Integrations** | Connects AI models to existing systems via APIs | Yes | Yes | Yes |
| | Implements RAG pipelines | - | Yes | Yes |
| | Works with embeddings and vector databases | - | Yes | Yes |
| | Designs prompts for system-level integration | Yes | Yes | Yes |
| | Builds error handling and fallback logic for AI calls | - | Yes | Yes |
| | Integrates AI into CI/CD and data pipelines | - | - | Yes |
| | Applies data governance and security practices to AI integrations | - | - | Yes |
| **AI Builder** | Uses AI tools to accelerate own development cycle | Yes | Yes | Yes |
| | Uses tokens efficiently | Yes | Yes | Yes |
| | Refines and iterates prompts / outputs | Yes | Yes | Yes |
| | Practices Spec-Driven Development | - | Yes | Yes |
| | Tests and validates AI-generated code | - | Yes | Yes |
| | Reviews AI output for correctness and security | - | Yes | Yes |
| | Makes production-readiness / operational judgment calls | - | - | Yes |

---

## 3. Detailed Competency Breakdown & Scoring Criteria

Each competency is scored on a scale from 1 to 5:
- **1 - Unacceptable**: Fails to meet basic requirements; exhibits critical anti-patterns or hallucinations.
- **2 - Marginal**: Partial understanding; requires heavy guidance; fragile implementation.
- **3 - Competent (Meets Tier Standard)**: Meets all expectations for the specified tier independently and consistently.
- **4 - Proficient (Exceeds Standard)**: Demonstrates proactive edge-case handling, superior code structure, and deep tool mastery.
- **5 - Exemplary**: Industry-leading execution; provides novel optimizations, robust architecture, and clear leadership.

---

### Category A: Agentic Architecture & Agentic Design

#### A.1 Uses coding agents effectively
- **Tier 1**: Directs an AI agent to navigate codebases, generate Page Object classes, and scaffold test files without manual copy-pasting errors.
- **Tier 2**: Directs agents to refactor existing test suites, migrate selector strategies, and perform multi-file transformations while maintaining green suites.
- **Tier 3**: Architectures complex automated refactoring pipelines, custom agent prompts, and automated reviewer bots that enforce repository-wide testing standards.
- *Anti-patterns*: Blindly accepting agent code without review; letting agents overwrite working fixtures with deprecated methods.

#### A.2 Understands MCPs (Model Context Protocol)
- **Tier 1**: Configures and interacts with an MCP server (e.g., Playwright MCP, browser inspector MCP) via Cursor, Claude Desktop, or Antigravity. Understands the protocol separation between client, host, and server.
- **Tier 2**: Understands JSON-RPC message formats, tool calling sequences, resource reads, and server state management. Resolves protocol-level disconnects or payload mismatches.
- **Tier 3**: Implements custom MCP servers from scratch or extends existing servers with custom domain tools (e.g., test execution engine, network interception tool, mock data provider).
- *Anti-patterns*: Confusing MCP with simple REST endpoints; unable to explain how the agent accesses the browser DOM through MCP.

#### A.3 Builds and uses Skills / Sub-agents
- **Tier 1**: Uses predefined agent workflows, system prompts, or skill files (e.g., `new-pom`, `run-smoke`) to guide agent execution.
- **Tier 2**: Authors custom project skills or specialized sub-agents (e.g., Research Agent, POM Generator, Spec Verifier) with specialized system instructions and scoped toolsets.
- **Tier 3**: Builds hierarchical sub-agent ecosystems where a parent orchestrator delegates discrete testing subtasks to autonomous worker agents and aggregates results.
- *Anti-patterns*: Overwhelming a single agent with all tasks simultaneously without skill scoping.

#### A.4 Plans multi-step execution and task decomposition
- **Tier 1**: Breaks down a testing requirement into clear sequential steps (e.g., 1. Inspect DOM via MCP -> 2. Define POM -> 3. Write Spec -> 4. Execute test).
- **Tier 2**: Generates technical implementation plans before code generation; handles dependencies, prerequisites, test data seeding, and teardown steps.
- **Tier 3**: Decomposes complex end-to-end multi-system integration testing across distributed architectures into deterministic agent execution graphs.
- *Anti-patterns*: Issuing massive one-shot prompts asking the agent to "write all tests for the app at once".

#### A.5 Designs multi-agent orchestration workflows
- **Tier 2**: Implements multi-step agent pipelines where output from a visual inspection agent feeds into a test authoring agent, followed by an execution feedback loop.
- **Tier 3**: Implements dynamic agent collaboration (e.g., Generator-Critic loops, automated TDD loops with self-correcting agents reacting to Playwright trace output).
- *Anti-patterns*: Uncontrolled infinite retry loops between agents without terminating conditions.

#### A.6 Manages context and memory across agent runs
- **Tier 2**: Prunes context windows strategically, prevents context pollution, and maintains session state across multi-turn debugging sessions.
- **Tier 3**: Builds external memory layers (vector index of test history, stateful test run artifacts, session cache) allowing agents to retain knowledge of flaky selectors and past resolutions.
- *Anti-patterns*: Pasting entire multi-megabyte log files or full HTML source dumps directly into conversation context.

#### A.7 Defines tool use / function-calling schemas
- **Tier 2**: Defines precise JSON schemas for MCP tools or custom function calls, including typed parameters, descriptions, and enum validations.
- **Tier 3**: Optimizes schema design for low LLM cognitive load, minimizes schema ambiguity, and creates self-describing tool APIs with clear error response contracts.
- *Anti-patterns*: Providing vague property descriptions that lead to hallucinated tool arguments.

---

### Category B: AI Integrations

#### B.1 Connects AI models to existing systems via APIs
- **Tier 1**: Configures API keys, base URLs, and authentication mechanisms to connect AI tooling to local or cloud LLM providers.
- **Tier 2**: Integrates AI API endpoints directly within test automation helper utilities (e.g., AI-assisted visual baseline comparison, dynamic test data generation).
- **Tier 3**: Deploys scalable gateway architectures for AI calls with rate-limiting, load balancing across multiple LLM providers, and cost monitoring.
- *Anti-patterns*: Hardcoding API keys in test repositories or git history.

#### B.2 Implements RAG (Retrieval-Augmented Generation) pipelines
- **Tier 2**: Implements retrieval mechanisms that feed local repository guidelines (`AGENTS.md`, design system specs, OpenAPI schemas) into the agent's context during test generation.
- **Tier 3**: Builds an automated RAG pipeline indexing the entire test suite, Playwright documentation, company UI component library, and Jira tickets to auto-generate regression tests.
- *Anti-patterns*: Relying on the base model's stale training data instead of retrieving live project context.

#### B.3 Works with embeddings and vector databases
- **Tier 2**: Generates embeddings for UI test failures or test cases to detect duplicate defects and group similar assertion failures.
- **Tier 3**: Architectures vector search infrastructure for automated test case deduplication, intelligent test impact analysis (TIA), and visual regression classification.
- *Anti-patterns*: Generating embeddings on unstructured, noisy log dumps without pre-processing.

#### B.4 Designs prompts for system-level integration
- **Tier 1**: Constructs clear, unambiguous system and user prompts specifying role, constraints, formatting requirements, and forbidden practices.
- **Tier 2**: Implements few-shot prompt templates with positive/negative examples, strict JSON output constraints, and chain-of-thought instructions for test logic synthesis.
- **Tier 3**: Designs meta-prompting frameworks and prompt versioning pipelines evaluated against quantitative benchmark test suites.
- *Anti-patterns*: Conversational, ambiguous prompts lacking explicit formatting or constraint rules.

#### B.5 Builds error handling and fallback logic for AI calls
- **Tier 2**: Implements structured retry policies with exponential backoff, fallback models (e.g., fallback from Pro to Flash or Claude Opus to Sonnet), and JSON repair parsers for malformed LLM responses.
- **Tier 3**: Implements resilient circuit-breaker patterns, deterministic fallback heuristics when AI services are degraded, and automated incident alerting.
- *Anti-patterns*: Letting raw LLM JSON parse errors crash the test execution runtime.

#### B.6 Integrates AI into CI/CD and data pipelines
- **Tier 3**: Embeds AI agentic test execution, automated test failure triage, and trace analysis directly into GitHub Actions / GitLab CI. Generates rich PR review summaries with automated root-cause analysis.
- *Anti-patterns*: Running non-deterministic AI generation steps inside production deployment gates without gating controls.

#### B.7 Applies data governance and security practices to AI integrations
- **Tier 3**: Enforces PII/PHI scrubbing before transmitting DOM snapshots or network payloads to external AI models. Implements strict zero-retention data policies and prevents prompt injection attacks via malicious web content.
- *Anti-patterns*: Sending production user data, session tokens, or payment details in LLM prompt payloads.

---

### Category C: AI Builder

#### C.1 Uses AI tools to accelerate own development cycle
- **Tier 1**: Demonstrates a 2x-3x acceleration in scaffolding Page Objects, locators, and smoke tests compared to manual authoring.
- **Tier 2**: Utilizes AI to rapidly generate comprehensive test data matrices, boundary condition tests, and edge-case mocks.
- **Tier 3**: Operates as a 10x test engineer by creating reusable autonomous workflows that multiply team-wide QA productivity.
- *Anti-patterns*: Spending more time debugging AI output than it would take to write a simple test manually.

#### C.2 Uses tokens efficiently
- **Tier 1**: Provides concise, focused context (specific DOM subtrees, relevant error messages) rather than full-page dumps.
- **Tier 2**: Utilizes token-efficient data representations (e.g., simplified accessibility trees instead of raw multi-megabyte DOMs) and selectively prunes chat history.
- **Tier 3**: Establishes enterprise token budgets, tracks cost per generated test case, and optimizes prompt token footprints without sacrificing output fidelity.
- *Anti-patterns*: Dumping entire 50,000-line HTML source files into chat prompts repeatedly.

#### C.3 Refines and iterates prompts / outputs
- **Tier 1**: Analyzes agent failure to generate the correct locator, adjusts prompt constraints, and guides the agent to a correct solution in <= 2 iterations.
- **Tier 2**: Systematically refines prompts based on root-cause analysis of agent errors; extracts recurring patterns into permanent project rules (`AGENTS.md`).
- **Tier 3**: Conducts prompt regression testing and systematic ablation studies to optimize prompt instructions across model upgrades.
- *Anti-patterns*: Repeatedly sending the exact same failing prompt hoping for a different outcome.

#### C.4 Practices Spec-Driven Development
- **Tier 2**: Writes unambiguous behavioral specifications, acceptance criteria, or typed test contracts before generating automation code. Uses the spec as the ground-truth benchmark for AI generation.
- **Tier 3**: Establishes organizational Spec-Driven AI pipelines where product requirements in Jira/markdown are automatically translated into validated Playwright test suites through deterministic verification gates.
- *Anti-patterns*: Asking the AI to "figure out what to test" without specifying expected business logic or acceptance criteria.

#### C.5 Tests and validates AI-generated code
- **Tier 2**: Executes local TypeScript compilation (`npm run typecheck`), linter checks, and targeted test execution to verify that AI-generated code executes cleanly.
- **Tier 3**: Employs mutation testing and negative testing to verify that AI-generated tests fail when bugs are intentionally introduced, ensuring assertion validity.
- *Anti-patterns*: Marking an AI-generated test as passing without executing it against both passing and failing conditions.

#### C.6 Reviews AI output for correctness and security
- **Tier 2**: Audits AI-generated code for silent anti-patterns (e.g., accidental truthy assertions `expect(locator)` instead of `await expect(locator).toBeVisible()`, hidden `page.waitForTimeout()`, insecure `eval` calls).
- **Tier 3**: Authors automated static analysis rules (ESLint plugins / AST checkers) that automatically block flawed AI-generated Playwright code at commit time.
- *Anti-patterns*: Committing code containing deprecated or imaginary APIs hallucinated by the model.

#### C.7 Makes production-readiness / operational judgment calls
- **Tier 3**: Evaluates test reliability, flakiness risks, execution duration, parallelism impact, and maintenance cost. Knows when to use deterministic code versus AI-driven flows.
- *Anti-patterns*: Over-engineering simple tests with unnecessary AI dependencies where static Playwright code is faster, cheaper, and 100% deterministic.

---

## 4. Scoring Summary & Tier Qualification Thresholds

### Minimum Passing Scores per Tier

| Assessment Tier | Minimum Category A Score | Minimum Category B Score | Minimum Category C Score | Overall Minimum Score | Required Competencies |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Tier 1 - Foundational** | 3.0 / 5.0 | 3.0 / 5.0 | 3.0 / 5.0 | 80% (36 / 45 pts) | All Tier 1 competencies must score >= 3. |
| **Tier 2 - Advanced** | 3.5 / 5.0 | 3.5 / 5.0 | 3.5 / 5.0 | 85% (72 / 85 pts) | All Tier 1 & 2 competencies must score >= 3. |
| **Tier 3 - Master** | 4.0 / 5.0 | 4.0 / 5.0 | 4.0 / 5.0 | 90% (95 / 105 pts)| All competencies across all tiers must score >= 4. |

### Immediate Disqualifiers (Automatic Fail)
1. **Committed Secrets**: API keys, auth tokens, or private credentials committed to git.
2. **Hardcoded Spec Locators**: Direct `page.locator()` queries in test spec files instead of POM classes.
3. **Silent Hallucinations**: Unverified, non-existent Playwright methods or invalid assertion syntax that fails at runtime.
4. **Arbitrary Timeouts**: Use of `page.waitForTimeout()` instead of auto-waiting Playwright assertions.
5. **Red Test Suite**: Submitting failing tests without an explicit `@skip` annotation and documented technical justification.
