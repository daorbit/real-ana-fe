import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import { LEAD_FORMS_BASE } from "@/features/leadCapture/themeParams";

export const FORMS_API_BASE = `${LEAD_FORMS_BASE.replace(/\/$/, "")}/api`;

type AppBaseQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;
type ExtraOptions = Parameters<AppBaseQuery>[2];
type Result<T> = { data: T } | { error: FetchBaseQueryError };

interface MintedToken {
  token: string;
  expiresAt: number;
}

interface FormsCall {
  workspaceId: string;
  path: string;
  method?: "GET" | "PUT" | "POST" | "DELETE";
  body?: unknown;
}

const EXPIRY_MARGIN_S = 60;
const tokens = new Map<string, MintedToken>();
const pending = new Map<string, Promise<Result<string>>>();

function cachedToken(workspaceId: string): string | null {
  const hit = tokens.get(workspaceId);
  if (!hit) return null;
  return hit.expiresAt - EXPIRY_MARGIN_S > Date.now() / 1000 ? hit.token : null;
}

function mintToken(
  workspaceId: string,
  queryApi: BaseQueryApi,
  extra: ExtraOptions,
  baseQuery: AppBaseQuery,
): Promise<Result<string>> {
  const cached = cachedToken(workspaceId);
  if (cached) return Promise.resolve({ data: cached });

  const inFlight = pending.get(workspaceId);
  if (inFlight) return inFlight;

  const request = Promise.resolve(
    baseQuery(
      { url: `/api/workspaces/${workspaceId}/forms-token`, method: "POST", body: {} },
      queryApi,
      extra,
    ),
  )
    .then((result): Result<string> => {
      if (result.error) return { error: result.error };
      const minted = result.data as MintedToken;
      tokens.set(workspaceId, minted);
      return { data: minted.token };
    })
    .finally(() => pending.delete(workspaceId));

  pending.set(workspaceId, request);
  return request;
}

export function formsSettingsUrl(workspaceId: string, path: string): string {
  return `${FORMS_API_BASE}/workspaces/${encodeURIComponent(workspaceId)}/settings${path}`;
}

export async function formsQuery<T>(
  call: FormsCall,
  queryApi: BaseQueryApi,
  extra: ExtraOptions,
  baseQuery: AppBaseQuery,
  retried = false,
): Promise<Result<T>> {
  const minted = await mintToken(call.workspaceId, queryApi, extra, baseQuery);
  if ("error" in minted) return minted;

  let res: Response;
  try {
    res = await fetch(formsSettingsUrl(call.workspaceId, call.path), {
      method: call.method ?? "GET",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${minted.data}` },
      body: call.body === undefined ? undefined : JSON.stringify(call.body),
      signal: queryApi.signal,
    });
  } catch {
    return { error: { status: "FETCH_ERROR", error: "Could not reach the forms service." } };
  }

  const payload: unknown = res.status === 204 ? undefined : await res.json().catch(() => undefined);
  if (res.ok) return { data: payload as T };

  const body = payload as { error?: string; message?: string } | undefined;
  if (res.status === 401 && body?.error?.startsWith("workspace_token") && !retried) {
    tokens.delete(call.workspaceId);
    return formsQuery<T>(call, queryApi, extra, baseQuery, true);
  }

  return {
    error: {
      status: res.status,
      data: {
        error: body?.message ?? body?.error ?? "The forms service refused the request.",
        code: body?.error,
      },
    },
  };
}
