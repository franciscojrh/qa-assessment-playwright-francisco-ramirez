import { APIRequestContext, APIResponse } from '@playwright/test';

import { API_CONFIG } from '@data/constants';

export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export interface HttpClientOptions {
  baseUrl?: string;
  apiKey?: string;
  /** Header name for the API key (default x-api-key). */
  apiKeyHeader?: string;
}

export interface RequestOptions {
  params?: Record<string, string>;
  data?: unknown;
  /** Pass `null` to omit the API key (auth negative tests). */
  apiKey?: string | null;
}

/**
 * Thin wrapper around Playwright's APIRequestContext.
 * Customize headers for your product's auth scheme.
 */
export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly apiKeyHeader: string;

  constructor(
    private readonly request: APIRequestContext,
    options: HttpClientOptions = {},
  ) {
    this.baseUrl = (options.baseUrl ?? API_CONFIG.baseUrl).replace(/\/$/, '');
    this.apiKey = options.apiKey ?? API_CONFIG.apiKey;
    this.apiKeyHeader = options.apiKeyHeader ?? 'x-api-key';
  }

  private url(path: string): string {
    return `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private headers(apiKey?: string | null): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (apiKey !== null && (apiKey ?? this.apiKey)) {
      headers[this.apiKeyHeader] = apiKey ?? this.apiKey;
    }
    return headers;
  }

  async get(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.request.get(this.url(path), {
      headers: this.headers(options.apiKey),
      params: options.params,
    });
  }

  async post(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.request.post(this.url(path), {
      headers: {
        ...this.headers(options.apiKey),
        'Content-Type': 'application/json',
      },
      data: options.data,
    });
  }

  async patch(path: string, options: RequestOptions = {}): Promise<APIResponse> {
    return this.request.patch(this.url(path), {
      headers: {
        ...this.headers(options.apiKey),
        'Content-Type': 'application/json',
      },
      data: options.data,
    });
  }
}

export function createHttpClient(
  request: APIRequestContext,
  options?: HttpClientOptions,
): HttpClient {
  return new HttpClient(request, options);
}
