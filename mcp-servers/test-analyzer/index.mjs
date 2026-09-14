#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import * as fs from "fs";
import * as path from "path";

// Initialize the MCP Server with strict naming compliance
const server = new Server(
  { name: "test-analyzer", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

/**
 * Retrieves the on-disk path of the Playwright JSON report via environment variables or fallback defaults.
 * @returns {string} Absolute path to the targeted JSON report file.
 */
function getReportPath() {
  const envPath = process.env.PLAYWRIGHT_JSON_REPORT;
  if (envPath) return path.resolve(envPath);
  const candidates = [
    path.resolve(process.cwd(), "test-results/report.json"),
    path.resolve(process.cwd(), "../../test-results/report.json"),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return candidates[0];
}

/**
 * Reads, parses, and returns the contents of the Playwright JSON report safely.
 */
function readReport() {
  const reportPath = getReportPath();
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Playwright JSON report not found at: ${reportPath}. Ensure your test suite has run at least once.`);
  }
  const rawData = fs.readFileSync(reportPath, "utf-8");
  return JSON.parse(rawData);
}

/**
 * Recursively flattens nested Playwright JSON suite blocks into a uniform array of spec test objects.
 */
function flattenTests(suite, fileContext = "") {
  let results = [];
  const currentFile = suite.file || fileContext;

  if (suite.specs) {
    for (const spec of suite.specs) {
      if (spec.tests) {
        for (const test of spec.tests) {
          results.push({
            title: spec.title,
            file: currentFile,
            line: spec.line,
            id: test.id,
            projectName: test.projectName,
            status: test.status, // expected, unexpected, flaky, skipped
            results: test.results || [] // contains individual iteration runs/retries
          });
        }
      }
    }
  }

  if (suite.suites) {
    for (const subSuite of suite.suites) {
      results.push(...flattenTests(subSuite, currentFile));
    }
  }

  return results;
}

// Define available tools matching framework definitions
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "get_test_summary",
        description: "Retrieves a high-level statistical summary of test results, including pass/fail metrics, execution duration, and project breakdowns.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_failures",
        description: "Extracts a detailed catalog of failed tests along with their associated execution error logs.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "get_slowest_tests",
        description: "Identifies the top slowest tests executed within the automation suite run.",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Number of top slow tests to return. Defaults to 5.", default: 5 }
          }
        }
      },
      {
        name: "get_flaky_candidates",
        description: "Isolates tests that experienced localized failures but subsequently passed on retry passes.",
        inputSchema: { type: "object", properties: {} }
      },
      {
        name: "compare_browsers",
        description: "Constructs a comparative side-by-side execution analysis categorized by browser projects.",
        inputSchema: { type: "object", properties: {} }
      }
    ]
  };
});

// Handle incoming execution logic requested by MCP client
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const report = readReport();
    const allTests = report.suites ? report.suites.flatMap(s => flattenTests(s)) : [];

    switch (name) {
      case "get_test_summary": {
        const total = allTests.length;
        const passed = allTests.filter(t => t.status === "expected").length;
        const failed = allTests.filter(t => t.status === "unexpected").length;
        const flaky = allTests.filter(t => t.status === "flaky").length;
        const skipped = allTests.filter(t => t.status === "skipped").length;
        
        let totalDuration = 0;
        allTests.forEach(t => t.results.forEach(r => totalDuration += (r.duration || 0)));

        return {
          content: [{
            type: "text",
            text: `### Playwright Test Execution Summary\n` +
                  `- **Total Executed Specs:** ${total}\n` +
                  `- ✅ **Passed:** ${passed}\n` +
                  `- ❌ **Failed:** ${failed}\n` +
                  `- ⚠️ **Flaky (Passed on Retry):** ${flaky}\n` +
                  `- ⏭️ **Skipped:** ${skipped}\n` +
                  `- ⏱️ **Gross Cumulative Duration:** ${(totalDuration / 1000).toFixed(2)}s`
          }]
        };
      }

      case "get_failures": {
        const failures = allTests.filter(t => t.status === "unexpected" || t.results.some(r => r.status === "failed"));
        if (failures.length === 0) {
          return { content: [{ type: "text", text: "🎉 Outstanding! Zero test compilation or runtime execution failures identified." }] };
        }

        const log = failures.map(f => {
          const errors = f.results
            .filter(r => r.error)
            .map(r => r.error.message || r.error.value)
            .join("\n   --> ");
          return `* **[${f.projectName}]** ${f.title}\n  - *File:* ${f.file}:${f.line}\n  - *Error Logs:* ${errors || "No direct explicit error message captured."}`;
        }).join("\n\n");

        return { content: [{ type: "text", text: `### Execution Failure Breakdown\n\n${log}` }] };
      }

      case "get_slowest_tests": {
        const limit = args?.limit || 5;
        const sorted = allTests
          .map(t => {
            const maxDuration = Math.max(...t.results.map(r => r.duration || 0), 0);
            return { ...t, maxDuration };
          })
          .sort((a, b) => b.maxDuration - a.maxDuration)
          .slice(0, limit);

        const log = sorted.map((t, idx) => `${idx + 1}. **[${t.projectName}]** ${t.title} (${(t.maxDuration / 1000).toFixed(2)}s)\n   - *Path:* ${t.file}`).join("\n");
        return { content: [{ type: "text", text: `### Top ${limit} Slowest Automation Specs\n\n${log}` }] };
      }

      case "get_flaky_candidates": {
        const flaky = allTests.filter(t => t.status === "flaky" || (t.results.length > 1 && t.status === "expected"));
        if (flaky.length === 0) {
          return { content: [{ type: "text", text: "✓ Splendid! Zero flaky retry-loop candidates detected across active suites." }] };
        }

        const log = flaky.map(t => `* **[${t.projectName}]** ${t.title}\n  - *Attempts Total:* ${t.results.length}\n  - *Location:* ${t.file}`).join("\n");
        return { content: [{ type: "text", text: `### Flaky Optimization Candidates (Passed after retries)\n\n${log}` }] };
      }

      case "compare_browsers": {
        const projects = {};
        allTests.forEach(t => {
          if (!projects[t.projectName]) projects[t.projectName] = { total: 0, passed: 0, failed: 0, skipped: 0 };
          projects[t.projectName].total++;
          if (t.status === "expected") projects[t.projectName].passed++;
          if (t.status === "unexpected") projects[t.projectName].failed++;
          if (t.status === "skipped") projects[t.projectName].skipped++;
        });

        let log = `### Cross-Browser Platform Metrics\n\n| Browser Project | Total Specs | Passed ✅ | Failed ❌ | Skipped ⏭️ |\n| --- | --- | --- | --- | --- |\n`;
        Object.entries(projects).forEach(([name, m]) => {
          log += `| **${name}** | ${m.total} | ${m.passed} | ${m.failed} | ${m.skipped} |\n`;
        });

        return { content: [{ type: "text", text: log }] };
      }

      default:
        throw new Error(`The requested analytical diagnostic tool identifier '${name}' is completely unknown.`);
    }
  } catch (error) {
    return {
      isError: true,
      content: [{ type: "text", text: `MCP Execution Diagnostics Interrupted: ${error.message}` }]
    };
  }
});

// Launch standard input/output transport channel hooks
const transport = new StdioServerTransport();
await server.connect(transport);