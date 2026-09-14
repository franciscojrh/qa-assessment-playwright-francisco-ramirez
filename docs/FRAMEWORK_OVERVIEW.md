# Framework overview

High-level view of the Playwright QA seed. Details and standards live in [`AGENTS.md`](../AGENTS.md).

## Layers

```mermaid
flowchart TB
  subgraph specs [tests/]
    UI[UI specs]
    API[API specs]
  end
  subgraph fixtures [src/fixtures]
    F[test / expect / appPage / httpApi]
  end
  subgraph pages [src/pages]
    POM[POMs extend BasePage]
  end
  subgraph api [src/api]
    HTTP[HttpClient]
  end
  UI --> F --> POM
  API --> F --> HTTP
  POM --> PW[Playwright]
  HTTP --> PW
```

## Local run lifecycle

```mermaid
sequenceDiagram
  participant Dev
  participant NPM
  participant PW as Playwright
  participant App as BASE_URL
  Dev->>NPM: typecheck + test:smoke
  NPM->>PW: grep @smoke
  PW->>App: navigate / assert via POM
  PW-->>Dev: report.json + HTML
```

## CI (example)

```mermaid
flowchart LR
  PR[Pull request] --> Job[ci-e2e.yml]
  Job --> Install[npm ci + browsers]
  Install --> Smoke[test:smoke]
  Smoke --> Artifacts[HTML + report.json]
```

## Tag strategy

| Tag | Intent |
|-----|--------|
| `@smoke` | Fast PR gate |
| `@regression` | Broader coverage, not always on every PR |
