/**
 * Browser-side API client for the admin panel.
 *
 * Unlike lib/api.ts (server-rendered public pages), every call here runs in the
 * browser and carries the session cookie. Requests are same-origin: Caddy routes
 * /api/* to the backend, so the httpOnly cookie is sent without any CORS dance.
 */

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    credentials: "same-origin",
    headers:
      init.body instanceof FormData
        ? init.headers
        : { "content-type": "application/json", ...init.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new AdminApiError(response.status, extractMessage(body, response.status));
  }

  return response.status === 204 ? (undefined as T) : ((await response.json()) as T);
}

/** FastAPI reports validation errors as a list of objects; flatten to one line. */
function extractMessage(body: unknown, status: number): string {
  const detail = (body as { detail?: unknown } | null)?.detail;

  if (typeof detail === "string") return detail;

  if (Array.isArray(detail)) {
    const first = detail[0] as { loc?: unknown[]; msg?: string } | undefined;
    if (first?.msg) {
      const field = Array.isArray(first.loc) ? first.loc.at(-1) : undefined;
      return field ? `${field}: ${first.msg}` : first.msg;
    }
  }

  return `Request failed (${status})`;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path: string) => request<void>(path, { method: "DELETE" }),
  upload: <T>(path: string, file: File) => {
    const data = new FormData();
    data.append("file", file);
    return request<T>(path, { method: "POST", body: data });
  },
};
