import type {
  BaseQueryApi,
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";

export type AppBaseQuery = BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError>;
export type ExtraOptions = Parameters<AppBaseQuery>[2];
export type Result<T> = { data: T } | { error: FetchBaseQueryError };

interface MintedToken {
  token: string;
  expiresAt: number;
}

export interface ServiceRequest {
  workspaceId: string;
  url: string;
  method?: "GET" | "PUT" | "POST" | "DELETE";
  body?: unknown;
}

interface ServiceOptions {
  tokenPath: string;
  unreachable: string;
  refused: string;
}

const EXPIRY_MARGIN_S = 60;

export function createServiceClient(options: ServiceOptions) {
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
        { url: `/api/workspaces/${workspaceId}/${options.tokenPath}`, method: "POST", body: {} },
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

  async function query<T>(
    request: ServiceRequest,
    queryApi: BaseQueryApi,
    extra: ExtraOptions,
    baseQuery: AppBaseQuery,
    retried = false,
  ): Promise<Result<T>> {
    const minted = await mintToken(request.workspaceId, queryApi, extra, baseQuery);
    if ("error" in minted) return minted;

    let res: Response;
    try {
      res = await fetch(request.url, {
        method: request.method ?? "GET",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${minted.data}` },
        body: request.body === undefined ? undefined : JSON.stringify(request.body),
        signal: queryApi.signal,
      });
    } catch {
      return { error: { status: "FETCH_ERROR", error: options.unreachable } };
    }

    const payload: unknown = res.status === 204 ? undefined : await res.json().catch(() => undefined);
    if (res.ok) return { data: payload as T };

    const body = payload as { error?: string; message?: string } | undefined;
    if (res.status === 401 && body?.error?.startsWith("workspace_token") && !retried) {
      tokens.delete(request.workspaceId);
      return query<T>(request, queryApi, extra, baseQuery, true);
    }

    return {
      error: {
        status: res.status,
        data: {
          error: body?.message ?? body?.error ?? options.refused,
          code: body?.error,
        },
      },
    };
  }

  return { query };
}
