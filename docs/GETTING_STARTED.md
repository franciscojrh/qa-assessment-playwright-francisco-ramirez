# Getting Started: Candidate Environment Setup & Repository Provisioning

This guide walks you through provisioning your assessment repository, granting access to the evaluation team, configuring your local environment, and connecting your Model Context Protocol (MCP) server.

For a 100% free setup ($0 budget) using Google Antigravity, Google AI Studio, and local open-source MCP tools, see [Zero-Cost Environment Setup Guide](FREE_SETUP_GUIDE.md).

---

## 1. Prerequisites

Ensure your machine has the following installed:
- **Node.js**: v18.18.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later
- **Git**: v2.30+
- An AI-assisted IDE or client supporting MCP (e.g., **Cursor**, **Claude Desktop**, **Antigravity**, or **Windsurf**)

---

## 2. Repository Provisioning & Granting Access

Every candidate completes their assessment in their own new GitHub repository and grants access to the evaluation team.

### Step 2.1: Create Your Assessment Repository
1. Create a new repository on your GitHub account (e.g., `qa-assessment-playwright-<your-name>`). Set visibility to **Private** (or Public if specified by your facilitator).
2. Clone this starter template or duplicate the codebase to your new repository:
   ```bash
   git clone <template-repo-url> qa-assessment-playwright-<your-name>
   cd qa-assessment-playwright-<your-name>
   git remote set-url origin <your-new-github-repo-url>
   git push -u origin main
   ```

### Step 2.2: Grant Access to the Evaluation Team
1. In your GitHub repository, navigate to **Settings** > **Collaborators** (or **Manage Access**).
2. Click **Add People**.
3. Enter the GitHub handles or email addresses provided by your facilitator / evaluation committee.
4. Confirm invitations so the evaluation team can review your branch and Pull Request.

### Step 2.3: Create Your Feature Branch
Always work on a dedicated submission branch:
```bash
git checkout -b submission/<your-name>
```

---

## 3. Local Installation & Verification

1. Install Node dependencies:
   ```bash
   npm install
   ```

2. Install Playwright browser binaries:
   ```bash
   npx playwright install --with-deps chromium
   ```

3. Run initial baseline validation:
   ```bash
   npm run typecheck
   npm run test:smoke
   ```

---

## 4. Configuring the Model Context Protocol (MCP) Server

To enable your AI agent to inspect live web pages, navigate the DOM, and capture accessibility snapshots, configure a Playwright MCP server.

### Option A: Configuration for Cursor (`.cursor/mcp.json` or Global Settings)

Add the following to your Cursor MCP settings (`~/.cursor/mcp.json` or project-level `.cursor/mcp.json`):

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

Or using the standard Puppeteer/Playwright browser inspector MCP:

```json
{
  "mcpServers": {
    "playwright-inspector": {
      "command": "node",
      "args": [
        "./node_modules/@modelcontextprotocol/server-puppeteer/dist/index.js"
      ]
    }
  }
}
```

### Option B: Configuration for Claude Desktop (`claude_desktop_config.json`)

On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`  
On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

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

### Option C: Configuration for Antigravity

Antigravity natively discovers MCP server definitions in `~/.gemini/antigravity/mcp/` or via project configuration.

Verify MCP connectivity by typing in agent chat:
```text
"List the available tools from the Playwright MCP server and navigate to https://playwright.dev"
```

---

## 5. Verifying MCP Tool Execution

To confirm that your AI agent is properly integrated with the MCP server:

1. Open your agent chat interface.
2. Issue the following verification prompt:
   ```text
   Navigate to https://playwright.dev using the Playwright MCP server, inspect the main navigation bar, and return the accessibility tree for the 'Docs' and 'API' navigation links.
   ```
3. Verify that the agent calls the appropriate MCP tool (e.g., `navigate`, `inspect_dom`, or `get_accessibility_snapshot`) and returns the element roles without hallucinating.

---

## 6. Daily Development Loop & Commands

| Command | Purpose |
|---------|---------|
| `npm run typecheck` | Validates strict TypeScript compilation across all files |
| `npm run lint` | Checks codebase against ESLint standards |
| `npm run test` | Executes all Playwright tests across configured browsers |
| `npm run test:smoke` | Runs tests tagged with `@smoke` |
| `npm run test:regression` | Runs tests tagged with `@regression` |
| `npm run test:debug` | Opens the Playwright interactive UI inspector |
| `npm run test:report` | Serves the generated Playwright HTML test report |

---

## 7. Submission Checklist

Before submitting your assessment:

- [ ] All code committed to branch `submission/<your-name>`.
- [ ] Pull Request opened against `main` in your repository.
- [ ] Evaluation team members invited as collaborators with read/write access.
- [ ] PR description completed with tool logs, prompt history, and test results.
- [ ] `npm run typecheck` and `npm run test` execute green locally.
