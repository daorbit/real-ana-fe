import { forgetSession, hasSession, rememberSession, type SessionHint } from "./sessionHint";

const BASE = import.meta.env.VITE_API_BASE ?? "";

const LEGACY_TOKEN_KEY = "rta_token";
const LEGACY_ADMIN_TOKEN_KEY = "rta_admin_token";

function readLegacyToken(): string | null {
  try {
    return localStorage.getItem(LEGACY_ADMIN_TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY);
  } catch {
    return null;
  }
}

function dropLegacyToken() {
  try {
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    localStorage.removeItem(LEGACY_ADMIN_TOKEN_KEY);
  } catch {
    return;
  }
}

async function adoptLegacyToken(): Promise<void> {
  const token = readLegacyToken();
  if (!token) return;
  try {
    const r = await api.postAs<{ session: SessionHint }>(token, "/api/auth/session", {});
    rememberSession(r.session);
    dropLegacyToken();
  } catch (e) {
    const status = (e as ApiError).status;
    if (status === 401 || status === 403) {
      dropLegacyToken();
      forgetSession();
    }
  }
}

let migration: Promise<void> | null = null;

export function migrateLegacySession(): Promise<void> {
  migration ??= adoptLegacyToken();
  return migration;
}

/** An error from the API, carrying the HTTP status and parsed body. */
export type ApiError = Error & {
  status?: number;
  body?: Record<string, unknown> | null;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    let body: Record<string, unknown> | null = null;
    try {
      body = await res.json();
      if (body?.error) msg = String(body.error);
    } catch {
      /* ignore */
    }
    // A 401 on a call that carried a token is an expired session, not a
    // sign-in attempt. Route it through the one shared handler. The `/auth`
    // endpoints are exempt: a wrong password there is a normal 401 the form
    // shows inline, not a reason to blow the whole session away.
    if (res.status === 401 && hasSession() && !path.includes("/auth/")) {
      void import("./session").then((m) => m.handleSessionExpired());
    }
    // A 423 means the account's screen lock is engaged — surfaced here so any
    // request anywhere, not just the idle timer's own, can bring the overlay
    // up if a stale lock state got out of sync. `/auth/login`'s own 423 is a
    // different thing entirely (the 12-hour wrong-password lock, before any
    // session exists) and is handled inline by the login form instead.
    if (res.status === 423 && !path.includes("/auth/")) {
      void import("./lockState").then((m) => m.showLock());
    }
    // Carry the status and payload on the error so callers that need more than
    // a message — a rate limit's retry time, say — can read it without
    // re-parsing a response that has already been consumed.
    const err = new Error(msg) as ApiError;
    err.status = res.status;
    err.body = body;
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(p: string) => request<T>(p),
  post: <T>(p: string, body: unknown) =>
    request<T>(p, { method: "POST", body: JSON.stringify(body) }),
  postAs: <T>(token: string, p: string, body: unknown) =>
    request<T>(p, { method: "POST", body: JSON.stringify(body), headers: { Authorization: `Bearer ${token}` } }),
  patch: <T>(p: string, body: unknown) =>
    request<T>(p, { method: "PATCH", body: JSON.stringify(body) }),
  del: (p: string) => request<void>(p, { method: "DELETE" }),
  /** DELETE for the endpoints that answer with the updated resource. */
  delFor: <T>(p: string) => request<T>(p, { method: "DELETE" }),
};

// Base origin used to build the embed snippet (BE origin)
export const API_ORIGIN = BASE || "http://localhost:4000";
