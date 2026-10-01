import * as fs from 'fs';
import * as path from 'path';
import { SecuritySanitizer } from '../src/utils/security-sanitizer';

// ─── Schema Types ─────────────────────────────────────────────────────────────

export interface PlaywrightTestError {
  message: string;
  stack?: string;
}

export interface PlaywrightTestResult {
  status: 'passed' | 'failed' | 'timedOut' | 'skipped';
  duration: number;
  errors: PlaywrightTestError[];
}

export interface PlaywrightSpec {
  title: string;
  tests?: Array<{ results?: PlaywrightTestResult[] }>;
}

export interface PlaywrightSuite {
  title: string;
  specs?: PlaywrightSpec[];
  suites?: PlaywrightSuite[];
}

export interface PlaywrightReport {
  suites?: PlaywrightSuite[];
  stats?: {
    expected: number;
    unexpected: number;
    skipped: number;
    duration: number;
  };
}

// ─── Classification ───────────────────────────────────────────────────────────

/** The three mutually-exclusive defect categories. */
export type FailureCategory = 'Product Defect' | 'Environment Flake' | 'Automation Bug';

export interface FailureDiagnostic {
  /** Fully-qualified test title. */
  test: string;
  /** Sanitized error message. */
  error: string;
  /** One of the three classification buckets. */
  classification: FailureCategory;
  /** Actionable root-cause recommendation. */
  recommendation: string;
}

/** Heuristic rule applied to raw error text to determine classification. */
interface ClassificationRule {
  pattern: RegExp;
  category: FailureCategory;
  recommendation: string;
}

/**
 * Ordered classification rules.
 * First match wins; if none match, defaults to "Product Defect".
 */
const CLASSIFICATION_RULES: ClassificationRule[] = [
  // ── Automation Bugs ──────────────────────────────────────────────────────────
  {
    pattern: /strict mode violation|resolved to \d+ elements|locator\(\) must resolve to exactly one/i,
    category: 'Automation Bug',
    recommendation:
      'Locator matches multiple elements. Refine selector with .first(), .nth(), or add a unique data-qa attribute to disambiguate.',
  },
  {
    pattern: /has no attribute|getByRole.*not found|no element found with/i,
    category: 'Automation Bug',
    recommendation:
      'Locator returned no elements. Verify the accessibility role, text, or test-id still matches the current DOM. Re-inspect with Playwright MCP.',
  },
  {
    pattern: /TimeoutError.*waiting for|Timeout \d+ms exceeded.*expect|locator\.waitFor/i,
    category: 'Automation Bug',
    recommendation:
      'Web-first assertion timed out. Check that the element is rendered within the assertion timeout and that no blocking overlay or loader is present.',
  },
  {
    pattern: /page\.waitForTimeout|arbitrary timeout/i,
    category: 'Automation Bug',
    recommendation:
      'Forbidden page.waitForTimeout() usage detected. Replace with web-first assertions or explicit network/load state waits.',
  },
  {
    pattern: /cannot read prop|is not a function|TypeError:/i,
    category: 'Automation Bug',
    recommendation:
      'JavaScript TypeError in test code. Review the Page Object method signature and fixture injection chain for mismatches.',
  },

  // ── Environment Flakes ───────────────────────────────────────────────────────
  {
    pattern: /net::ERR_|ERR_CONNECTION_|ECONNREFUSED|ENOTFOUND|ERR_NAME_NOT_RESOLVED/i,
    category: 'Environment Flake',
    recommendation:
      'Network connectivity error. Verify the target URL is reachable from the CI runner and that BASE_URL env var is correctly configured.',
  },
  {
    pattern: /ERR_CERT_|SSL|TLS handshake|certificate/i,
    category: 'Environment Flake',
    recommendation:
      'TLS/SSL certificate error. Ensure the test environment serves a valid certificate or set `ignoreHTTPSErrors: true` for staging environments.',
  },
  {
    pattern: /crash|browser process exited|playwright.*closed|target closed/i,
    category: 'Environment Flake',
    recommendation:
      'Browser process crashed unexpectedly. Check available runner memory (OOM) and ensure Playwright browsers are fully installed (`npm run setup`).',
  },
  {
    pattern: /ENOMEM|out of memory|heap.*allocation failed/i,
    category: 'Environment Flake',
    recommendation:
      'Out-of-memory error. Reduce parallel workers in CI configuration or increase runner memory.',
  },

  // ── Product Defects (fall-through) ──────────────────────────────────────────
  {
    pattern: /expected.*to (have text|contain text|be visible|be enabled|be checked|have value)/i,
    category: 'Product Defect',
    recommendation:
      'Assertion mismatch against expected UI state. The application may have introduced a UI regression. File a bug report with the trace artifact.',
  },
  {
    pattern: /404|403|500|502|503/i,
    category: 'Product Defect',
    recommendation:
      'Unexpected HTTP error status. The API or page route may be broken. Attach network traces to the defect ticket.',
  },
];

// ─── Triage Engine ───────────────────────────────────────────────────────────

export class AiFailureTriage {
  private readonly reportPath: string;

  constructor(reportPath: string) {
    this.reportPath = path.resolve(reportPath);
  }

  // ── Report Ingestion ─────────────────────────────────────────────────────────

  /**
   * Reads and parses the Playwright JSON report, sanitizes content,
   * classifies every failure, and outputs a markdown diagnostic report.
   */
  public analyzeReport(): void {
    if (!fs.existsSync(this.reportPath)) {
      console.error(`[ai-triage] Report not found: ${this.reportPath}`);
      process.exit(1);
    }

    const raw = fs.readFileSync(this.reportPath, 'utf-8');
    // Sanitize before any processing to ensure no PII leaks into output
    const sanitizedRaw = SecuritySanitizer.sanitizeText(raw);
    const report: PlaywrightReport = JSON.parse(sanitizedRaw);

    const diagnostics = this.extractFailures(report);

    if (diagnostics.length === 0) {
      const successSummary = '## ✅ AI Triage: All Tests Passed\n\nNo failures detected in this run.\n';
      this.writeSummary(successSummary);
      console.log(successSummary);
      return;
    }

    this.generateSummaryMarkdown(diagnostics);
  }

  // ── Failure Extraction ───────────────────────────────────────────────────────

  /**
   * Recursively walks the suite tree collecting all failed test results.
   */
  private extractFailures(report: PlaywrightReport): FailureDiagnostic[] {
    const diagnostics: FailureDiagnostic[] = [];

    const walkSuite = (suite: PlaywrightSuite, breadcrumb: string): void => {
      const prefix = breadcrumb ? `${breadcrumb} > ${suite.title}` : suite.title;

      for (const spec of suite.specs ?? []) {
        const testTitle = `${prefix} > ${spec.title}`;

        for (const test of spec.tests ?? []) {
          for (const result of test.results ?? []) {
            if (result.status === 'failed' || result.status === 'timedOut') {
              const errorMessage = result.errors.map((e) => e.message).join('\n').trim();
              const sanitizedError = SecuritySanitizer.sanitizeText(errorMessage);
              const classification = this.classifyFailure(sanitizedError);
              const recommendation = this.getRecommendation(sanitizedError);

              diagnostics.push({
                test: testTitle,
                error: sanitizedError || '(no error message captured)',
                classification,
                recommendation,
              });
            }
          }
        }
      }

      for (const child of suite.suites ?? []) {
        walkSuite(child, prefix);
      }
    };

    for (const suite of report.suites ?? []) {
      walkSuite(suite, '');
    }

    return diagnostics;
  }

  // ── Classification ───────────────────────────────────────────────────────────

  /**
   * Classifies an error message into one of three defect buckets using
   * ordered heuristic rules. Falls back to "Product Defect" if no rule matches.
   *
   * @param errorMessage Sanitized error text from the test result
   * @returns Human-readable classification label
   */
  public classifyFailure(errorMessage: string): FailureCategory {
    for (const rule of CLASSIFICATION_RULES) {
      if (rule.pattern.test(errorMessage)) {
        return rule.category;
      }
    }
    return 'Product Defect';
  }

  /**
   * Returns the actionable recommendation matching the first matched rule.
   */
  private getRecommendation(errorMessage: string): string {
    for (const rule of CLASSIFICATION_RULES) {
      if (rule.pattern.test(errorMessage)) {
        return rule.recommendation;
      }
    }
    return 'Review the Playwright trace artifact and compare against the expected UI specification.';
  }

  // ── Markdown Report ──────────────────────────────────────────────────────────

  /**
   * Outputs a structured markdown diagnostic report to stdout and, when
   * running in GitHub Actions, appends it to `$GITHUB_STEP_SUMMARY`.
   */
  public generateSummaryMarkdown(diagnostics: FailureDiagnostic[]): void {
    const categoryCount: Record<FailureCategory, number> = {
      'Product Defect': 0,
      'Environment Flake': 0,
      'Automation Bug': 0,
    };

    for (const d of diagnostics) {
      categoryCount[d.classification]++;
    }

    const categoryEmoji: Record<FailureCategory, string> = {
      'Product Defect': '🐛',
      'Environment Flake': '🌩️',
      'Automation Bug': '🔧',
    };

    const lines: string[] = [
      '## 🤖 AI Failure Triage Report',
      '',
      `> Generated: ${new Date().toISOString()} | Total Failures: **${diagnostics.length}**`,
      '',
      '### Summary',
      '',
      '| Category | Count |',
      '|----------|-------|',
      `| 🐛 Product Defect | ${categoryCount['Product Defect']} |`,
      `| 🌩️ Environment Flake | ${categoryCount['Environment Flake']} |`,
      `| 🔧 Automation Bug | ${categoryCount['Automation Bug']} |`,
      '',
      '---',
      '',
      '### Failure Diagnostics',
      '',
    ];

    for (let i = 0; i < diagnostics.length; i++) {
      const d = diagnostics[i];
      const emoji = categoryEmoji[d.classification as FailureCategory] ?? '❓';

      lines.push(
        `#### ${i + 1}. ${emoji} \`${d.classification}\``,
        '',
        `**Test**: \`${d.test}\``,
        '',
        '**Error**:',
        '```',
        d.error.slice(0, 500) + (d.error.length > 500 ? '\n… [truncated]' : ''),
        '```',
        '',
        `**Recommendation**: ${d.recommendation}`,
        '',
        '---',
        '',
      );
    }

    lines.push(
      '### Next Steps',
      '',
      '- **Product Defect** → File a bug in the issue tracker with trace + screenshot artifacts.',
      '- **Environment Flake** → Investigate CI runner health, network configuration, and browser installation.',
      '- **Automation Bug** → Refine the locator or assertion strategy using Playwright MCP inspection.',
      '',
      '> *Report generated by the AI Failure Triage utility. All PII and auth tokens have been redacted before output.*',
    );

    const markdown = lines.join('\n');
    this.writeSummary(markdown);
    console.log(markdown);
  }

  // ── CI Integration ───────────────────────────────────────────────────────────

  /**
   * Writes the markdown summary to $GITHUB_STEP_SUMMARY when running in CI.
   */
  private writeSummary(content: string): void {
    const summaryFile = process.env['GITHUB_STEP_SUMMARY'];
    if (summaryFile) {
      fs.appendFileSync(summaryFile, content + '\n');
    }
  }
}

// ── CLI Entry Point ───────────────────────────────────────────────────────────

if (require.main === module) {
  const reportFile = process.argv[2] || './test-results/report.json';
  const triage = new AiFailureTriage(reportFile);
  triage.analyzeReport();
}
