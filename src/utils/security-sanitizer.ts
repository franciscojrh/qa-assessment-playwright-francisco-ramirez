/**
 * Security & Data Governance Sanitizer
 *
 * Scrubs PII, authentication tokens, credit card numbers, email addresses,
 * and session headers before DOM snapshots or network payloads are transmitted
 * to external AI endpoints or MCP servers.
 *
 * Also defends against prompt-injection patterns embedded in dynamic web content.
 */

/** Canonical replacement tokens used in place of redacted values. */
export const REDACTION_TOKENS = {
  EMAIL: '[REDACTED:EMAIL]',
  CREDIT_CARD: '[REDACTED:CC]',
  AUTH_TOKEN: '[REDACTED:TOKEN]',
  SESSION_COOKIE: '[REDACTED:SESSION]',
  API_KEY: '[REDACTED:API_KEY]',
  PASSWORD: '[REDACTED:PASSWORD]',
  SSN: '[REDACTED:SSN]',
  PHONE: '[REDACTED:PHONE]',
  IP_ADDRESS: '[REDACTED:IP]',
  PROMPT_INJECTION: '[REDACTED:INJECTION]',
} as const;

/** Ordered list of sanitization rules applied left-to-right. */
const SANITIZATION_RULES: Array<{ pattern: RegExp; token: string }> = [
  // ── Auth & Secrets ──────────────────────────────────────────────────────────
  // Bearer tokens (Authorization header values or inline strings)
  {
    pattern: /Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi,
    token: `Bearer ${REDACTION_TOKENS.AUTH_TOKEN}`,
  },
  // JWT structure: three base64url segments separated by dots
  {
    pattern: /\beyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\b/g,
    token: REDACTION_TOKENS.AUTH_TOKEN,
  },
  // Generic API keys in key=value or key: value formats
  {
    pattern: /(?:api[_-]?key|apikey|x-api-key|token)\s*[:=]\s*["']?[A-Za-z0-9\-_]{16,}["']?/gi,
    token: `api_key: ${REDACTION_TOKENS.API_KEY}`,
  },
  // AWS-style access key IDs
  {
    pattern: /\bAKIA[0-9A-Z]{16}\b/g,
    token: REDACTION_TOKENS.API_KEY,
  },
  // Password fields in JSON or query strings
  {
    pattern: /(?:"password"|'password'|password)\s*[:=]\s*["']?[^\s"',}&]{4,}["']?/gi,
    token: `"password": "${REDACTION_TOKENS.PASSWORD}"`,
  },
  // Session / cookie strings
  {
    pattern: /(?:session[_-]?id|session[_-]?token|sid|PHPSESSID|connect\.sid)\s*[:=]\s*["']?[A-Za-z0-9\-_.%]{10,}["']?/gi,
    token: `session: ${REDACTION_TOKENS.SESSION_COOKIE}`,
  },
  // Authorization header (full line)
  {
    pattern: /Authorization\s*:\s*.+/gi,
    token: `Authorization: ${REDACTION_TOKENS.AUTH_TOKEN}`,
  },
  // Cookie header (full line)
  {
    pattern: /Cookie\s*:\s*.+/gi,
    token: `Cookie: ${REDACTION_TOKENS.SESSION_COOKIE}`,
  },

  // ── PII ─────────────────────────────────────────────────────────────────────
  // Email addresses
  {
    pattern: /\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b/g,
    token: REDACTION_TOKENS.EMAIL,
  },
  // US Social Security Numbers (ddd-dd-dddd or ddddddddd)
  {
    pattern: /\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
    token: REDACTION_TOKENS.SSN,
  },
  // Credit / debit card numbers (major network patterns)
  {
    pattern: /\b(?:4[0-9]{12}(?:[0-9]{3,6})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g,
    token: REDACTION_TOKENS.CREDIT_CARD,
  },
  // Generic 16-digit card-like numbers with spaces/dashes
  {
    pattern: /\b\d{4}[\s\-]\d{4}[\s\-]\d{4}[\s\-]\d{4}\b/g,
    token: REDACTION_TOKENS.CREDIT_CARD,
  },
  // US phone numbers (+1-ddd-ddd-dddd, (ddd) ddd-dddd, etc.)
  {
    pattern: /\b(?:\+?1[\s.\-]?)?\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}\b/g,
    token: REDACTION_TOKENS.PHONE,
  },
  // IPv4 addresses
  {
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g,
    token: REDACTION_TOKENS.IP_ADDRESS,
  },

  // ── Prompt Injection Defense ─────────────────────────────────────────────────
  // Strips common injection patterns that could hijack LLM instructions
  {
    pattern: /(?:ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions?|disregard\s+(?:your\s+)?(?:previous\s+)?(?:instructions?|system\s+prompt)|you\s+are\s+now\s+(?:a|an)\s+\w+|forget\s+(?:everything|all)\s+(?:you|I)\s+(?:said|told))/gi,
    token: REDACTION_TOKENS.PROMPT_INJECTION,
  },
];

/** Sensitive JSON field names whose values should be fully replaced. */
const SENSITIVE_FIELD_NAMES = new Set([
  'password',
  'passwd',
  'secret',
  'token',
  'accesstoken',
  'access_token',
  'refreshtoken',
  'refresh_token',
  'apikey',
  'api_key',
  'authorization',
  'cookie',
  'sessionid',
  'session_id',
  'sessiontoken',
  'session_token',
  'privatekey',
  'private_key',
  'clientsecret',
  'client_secret',
  'ssn',
  'creditcard',
  'credit_card',
  'cardnumber',
  'card_number',
  'cvv',
  'cvc',
]);

export class SecuritySanitizer {
  /**
   * Sanitizes a raw text or DOM snapshot string by masking sensitive patterns.
   *
   * Rules are applied in declaration order so that broader patterns
   * (e.g. Authorization headers) take precedence over narrower ones.
   *
   * @param input Raw text containing potential PII or secrets
   * @returns Sanitized string with sensitive patterns replaced by tokens
   */
  public static sanitizeText(input: string): string {
    if (typeof input !== 'string') return input;

    let output = input;
    for (const rule of SANITIZATION_RULES) {
      output = output.replace(rule.pattern, rule.token);
    }
    return output;
  }

  /**
   * Sanitizes a JSON payload object recursively.
   *
   * - Keys matching `SENSITIVE_FIELD_NAMES` have their values fully replaced.
   * - String values are run through `sanitizeText`.
   * - Arrays and nested objects are traversed recursively.
   *
   * @param obj Object containing potential sensitive fields
   * @returns Deep sanitized copy of the object
   */
  public static sanitizeObject<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;

    if (Array.isArray(obj)) {
      return obj.map((item) => SecuritySanitizer.sanitizeObject(item)) as unknown as T;
    }

    if (typeof obj === 'string') {
      return SecuritySanitizer.sanitizeText(obj) as unknown as T;
    }

    if (typeof obj === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
        if (SENSITIVE_FIELD_NAMES.has(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = SecuritySanitizer.sanitizeObject(value);
        }
      }
      return sanitized as T;
    }

    return obj;
  }

  /**
   * Sanitizes HTTP request/response headers, removing auth and cookie values.
   *
   * @param headers Key-value header map
   * @returns Sanitized header map
   */
  public static sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const SENSITIVE_HEADER_NAMES = new Set([
      'authorization',
      'cookie',
      'set-cookie',
      'x-api-key',
      'x-auth-token',
      'x-session-token',
      'proxy-authorization',
    ]);

    const sanitized: Record<string, string> = {};
    for (const [name, value] of Object.entries(headers)) {
      if (SENSITIVE_HEADER_NAMES.has(name.toLowerCase())) {
        sanitized[name] = REDACTION_TOKENS.AUTH_TOKEN;
      } else {
        sanitized[name] = SecuritySanitizer.sanitizeText(value);
      }
    }
    return sanitized;
  }

  /**
   * Produces a sanitized, token-efficient summary of a DOM snapshot
   * safe to transmit to an external LLM or MCP server.
   *
   * @param html Raw HTML string from a page snapshot
   * @param maxLength Maximum character limit for the returned summary (default 8000)
   * @returns Sanitized, truncated HTML string
   */
  public static sanitizeDomSnapshot(html: string, maxLength: number = 8_000): string {
    const sanitized = SecuritySanitizer.sanitizeText(html);
    if (sanitized.length <= maxLength) return sanitized;
    return sanitized.slice(0, maxLength) + '\n<!-- [DOM TRUNCATED FOR TOKEN EFFICIENCY] -->';
  }
}
