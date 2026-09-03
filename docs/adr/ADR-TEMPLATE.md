# Architecture Decision Record (ADR) Template

## Title: [Short Title of Architectural Decision]
- **Status**: [Proposed | Accepted | Superseded]
- **Date**: [YYYY-MM-DD]
- **Author**: [Candidate Name]
- **Assigned Tier**: Tier 3 (Master / Certification)

---

## 1. Context & Problem Statement
[Describe the testing challenge, architecture requirements, scale, and why a decision is necessary.]

## 2. Decision Drivers
- [Driver 1: e.g., Flakiness reduction, locator maintenance overhead]
- [Driver 2: e.g., AI token cost constraints and latency budgets]
- [Driver 3: e.g., Security & PII compliance policies]
- [Driver 4: e.g., CI/CD execution determinism]

## 3. Considered Options
- **Option 1**: [Description of approach A]
- **Option 2**: [Description of approach B]
- **Option 3**: [Description of approach C]

## 4. Decision Outcome & Architecture Topology
[State the chosen architecture, how MCP tools are integrated, how Page Objects and fixtures are structured, and how CI/CD triage functions.]

### 4.1 System Topology Diagram
```
[Insert ASCII / Mermaid architecture diagram here]
```

### 4.2 Security Governance & Data Scrubbing Boundary
[Detail how PII and credentials are protected from leaking to AI APIs.]

### 4.3 Operational Reliability & Cost Model
[Provide SLO targets (e.g. Flakiness < 1%, AI Triage Precision > 90%) and estimated token cost per CI test run.]

## 5. Consequences & Trade-offs
- **Positive Impacts**: [List advantages]
- **Negative Impacts / Risks**: [List trade-offs and mitigation strategies]
