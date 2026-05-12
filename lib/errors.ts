/* Standardized error envelope for /api/v1/* responses.
   Every error response across the API surface returns this shape so SDK
   consumers can branch on `code` instead of parsing English strings. */

export type ErrorCode =
  | 'invalid_json'
  | 'validation_failed'
  | 'rate_limit'
  | 'demo_offline'
  | 'auth_failed'
  | 'upstream_overloaded'
  | 'upstream_rate_limit'
  | 'upstream_error'
  | 'timeout'
  | 'aborted'
  | 'ssrf_blocked'
  | 'tool_unavailable'
  | 'internal';

export interface ErrorEnvelope {
  error: string;
  code: ErrorCode;
  detail: string;
  doc_url?: string;
  request_id: string;
}

const DOCS_BASE = 'https://brocco.dev/docs/errors';

export function makeRequestId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `req_${crypto.randomUUID().replace(/-/g, '').slice(0, 24)}`;
  }
  return `req_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

export function makeError(
  code: ErrorCode,
  detail: string,
  opts: { requestId?: string; docUrl?: string } = {},
): ErrorEnvelope {
  return {
    error: code.replace(/_/g, ' '),
    code,
    detail,
    doc_url: opts.docUrl ?? `${DOCS_BASE}#${code}`,
    request_id: opts.requestId ?? makeRequestId(),
  };
}

const STATUS_BY_CODE: Record<ErrorCode, number> = {
  invalid_json: 400,
  validation_failed: 400,
  rate_limit: 429,
  demo_offline: 503,
  auth_failed: 401,
  upstream_overloaded: 503,
  upstream_rate_limit: 429,
  upstream_error: 502,
  timeout: 504,
  aborted: 499,
  ssrf_blocked: 403,
  tool_unavailable: 503,
  internal: 500,
};

export function errorResponse(
  code: ErrorCode,
  detail: string,
  opts: { requestId?: string; docUrl?: string; extraHeaders?: HeadersInit } = {},
): Response {
  const env = makeError(code, detail, opts);
  return Response.json(env, {
    status: STATUS_BY_CODE[code],
    headers: { 'X-Brocco-Request-Id': env.request_id, ...(opts.extraHeaders ?? {}) },
  });
}
