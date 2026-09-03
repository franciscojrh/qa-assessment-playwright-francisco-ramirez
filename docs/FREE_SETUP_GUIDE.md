# Zero-Cost Environment Setup Guide: Antigravity, Gemini & Local MCP

## 1. Overview & Free Infrastructure Stack ($0 Budget)

This guide provides step-by-step instructions to configure a complete, professional, and **100% free environment ($0 total cost)** for conducting the QA assessment.

By combining **Google Antigravity**, **Google AI Studio (Gemini Free Tier)**, **local open-source MCP servers**, and **GitHub Actions free minutes**, candidates can execute the entire assessment—from Tier 1 foundational tests to Tier 3 enterprise CI/CD triage—without purchasing paid subscriptions or API credits.

---

### Free Infrastructure Stack Summary

| Layer | Component | Cost | Free Quota / Capabilities |
| :--- | :--- | :--- | :--- |
| **Agentic IDE** | Google Antigravity IDE | $0 (Free) | Native MCP integration, agent execution, and chat interface. |
| **Frontier LLM** | Gemini 2.0 Flash / Pro via Google AI Studio | $0 (Free Tier) | 15 RPM (Requests Per Minute), 1,000,000 TPM (Tokens Per Minute), 1,500 RPD (Requests Per Day). |
| **Local MCP Server** | `@executeautomation/playwright-mcp-server` | $0 (Open Source) | Runs locally via `npx` to control local Chromium; zero cloud cost. |
| **Browser Engine** | Playwright Chromium Binaries | $0 (Open Source) | Local browser automation engine. |
| **CI/CD Execution (Tier 3)** | GitHub Actions | $0 (Free Tier) | 2,000 free runner minutes per month for GitHub accounts. |
| **Offline LLM (Optional)** | Ollama (`qwen2.5-coder` / `llama3.3`) | $0 (Open Source) | 100% offline local model execution without internet connection. |

---

## 2. Step-by-Step Installation & Configuration

### Step 1: Install Node.js, Git, and Project Dependencies

1. Ensure **Node.js v18.18+ or v20+** is installed:
   ```bash
   node -v
   npm -v
   ```
2. Clone your assessment repository and install dependencies:
   ```bash
   git clone <your-repository-url>
   cd qa-assesment-playwright-mcp
   npm install
   ```
3. Install Playwright browser binaries and system dependencies:
   ```bash
   npx playwright install --with-deps chromium
   ```

---

### Step 2: Generate a Free Google AI Studio API Key (`GEMINI_API_KEY`)

The free API key provides access to Gemini 2.0 Flash and Gemini 1.5 Pro with generous daily quotas for local testing and CI/CD failure triage (`scripts/ai-triage.ts`):

1. Navigate to **[Google AI Studio](https://aistudio.google.com/)**.
2. Sign in with any standard Google account.
3. Click on **Get API Key** in the left sidebar.
4. Click **Create API Key** (choose an existing project or create a free default project).
5. Copy the generated key (`AIzaSy...`).
6. Set the environment variable locally on your machine:
   - **macOS / Linux (`~/.zshrc` or `~/.bashrc`)**:
     ```bash
     export GEMINI_API_KEY="AIzaSyYourGeneratedKeyHere"
     ```
   - **Windows (Command Prompt / PowerShell)**:
     ```powershell
     [System.Environment]::SetEnvironmentVariable('GEMINI_API_KEY', 'AIzaSyYourGeneratedKeyHere', 'User')
     ```

---

### Step 3: Configure the Local Playwright MCP Server

The Playwright MCP server runs locally on your machine, exposing tools for navigation, DOM inspection, clicking, and taking accessibility snapshots.

#### Option A: Running with Antigravity IDE
Antigravity automatically discovers and manages local MCP servers. To configure it:
1. Verify the local Playwright MCP package can be executed:
   ```bash
   npx -y @executeautomation/playwright-mcp-server
   ```
2. In Antigravity settings or project configuration, add the server definition:
   ```json
   {
     "mcpServers": {
       "playwright": {
         "command": "npx",
         "args": [
           "-y",
           "@executeautomation/playwright-mcp-server"
         ]
       }
     }
   }
   ```

#### Option B: Running with Official Anthropic Puppeteer/Playwright MCP Server
Alternatively, use the official Model Context Protocol server:
```json
{
  "mcpServers": {
    "playwright-inspector": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-puppeteer"
      ]
    }
  }
}
```

---

### Step 4: Configure GitHub Actions Free Tier & Secrets (Tier 3)

For Tier 3 candidates implementing automated AI test failure triage in CI/CD:

1. Navigate to your assessment repository on GitHub.
2. Go to **Settings** > **Secrets and variables** > **Actions**.
3. Click **New repository secret**.
4. Set **Name**: `GEMINI_API_KEY` (or `AI_API_KEY`).
5. Set **Value**: Paste your free Google AI Studio key (`AIzaSy...`).
6. Click **Add secret**.

The workflow file [`.github/workflows/test-automation.yml`](../.github/workflows/test-automation.yml) will automatically consume this secret during failed test runs at zero cost.

---

### Step 5: (Optional) 100% Offline Local LLM Setup with Ollama

If your organization requires a completely offline or air-gapped evaluation environment:

1. Download and install **[Ollama](https://ollama.com/)**.
2. Pull a high-performance open-source coding model:
   ```bash
   ollama pull qwen2.5-coder:14b
   # Or for lightweight machines (8GB RAM):
   ollama pull qwen2.5-coder:7b
   ```
3. Start the Ollama server:
   ```bash
   ollama serve
   ```
4. Connect your MCP client to the local Ollama OpenAI-compatible endpoint at `http://localhost:11434/v1`.

---

## 3. Environment Verification & Health Check

Confirm that your zero-cost stack is fully operational before starting your assessment challenge.

### Verification Checklist

1. **Verify TypeScript Compilation**:
   ```bash
   npm run typecheck
   ```
   *Expected Output*: Exit code 0 with zero compiler errors.

2. **Verify Playwright Test Runner**:
   ```bash
   npm run test:smoke
   ```
   *Expected Output*: Baseline sample spec passes cleanly.

3. **Verify MCP Agent Browser Control**:
   In your Antigravity chat, issue the following verification prompt:
   ```text
   Use the Playwright MCP server to navigate to https://playwright.dev and retrieve the accessibility roles for the main navigation buttons.
   ```
   *Expected Output*: Agent calls `navigate` and `inspect_dom` via MCP and returns the structured accessibility tree without errors.

---

## 4. Troubleshooting & Best Practices for Free Tiers

- **Rate Limit Management (429 Errors)**:
  Google AI Studio free tier allows up to 15 requests per minute. If running automated scripts in a tight loop, introduce a 4-second delay between sequential triage calls to respect rate boundaries.
- **MCP Port Conflicts**:
  If the MCP server reports an address in use, terminate orphan Node processes:
  ```bash
  # macOS / Linux
  pkill -f playwright-mcp-server
  ```
- **Token Efficiency**:
  Always instruct the agent to inspect specific element subtrees or request accessibility trees rather than dumping full HTML pages to preserve token quotas.
