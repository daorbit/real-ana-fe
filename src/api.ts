const BASE = import.meta.env.VITE_API_BASE ?? "";

const TOKEN_KEY = "rta_token";
/** Holds the admin's own token while they are impersonating someone. */
const ADMIN_TOKEN_KEY = "rta_admin_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(t: string) {
  localStorage.setItem(TOKEN_KEY, t);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

/**
 * Swap in an impersonation token, keeping the admin's own token aside so
 * `stopImpersonating` can put it back. Surviving a refresh is the point of
 * storing it rather than holding it in memory.
 */
export function startImpersonating(token: string) {
  const own = getToken();
  if (own) localStorage.setItem(ADMIN_TOKEN_KEY, own);
  setToken(token);
}

/** Restore the admin's own token. Returns false if there was nothing to restore. */
export function stopImpersonating(): boolean {
  const own = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!own) return false;
  setToken(own);
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  return true;
}

export function isImpersonating(): boolean {
  return localStorage.getItem(ADMIN_TOKEN_KEY) !== null;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) msg = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body: unknown) =>
    request<T>(p, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(p: string, body: unknown) =>
    request<T>(p, { method: "PATCH", body: JSON.stringify(body) }),
  del: (p: string) => request<void>(p, { method: "DELETE" }),
};

// Base origin used to build the embed snippet (BE origin)
export const API_ORIGIN = BASE || "http://localhost:4000";
