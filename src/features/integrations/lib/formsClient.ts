import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import { LEAD_FORMS_BASE } from "@/features/leadCapture/themeParams";
import { createServiceClient, type AppBaseQuery, type ExtraOptions, type Result } from "./serviceClient";

export const FORMS_API_BASE = `${LEAD_FORMS_BASE.replace(/\/$/, "")}/api`;

interface FormsCall {
  workspaceId: string;
  path: string;
  method?: "GET" | "PUT" | "POST" | "DELETE";
  body?: unknown;
  area?: "settings" | "forms";
}

const client = createServiceClient({
  tokenPath: "forms-token",
  unreachable: "Could not reach the forms service.",
  refused: "The forms service refused the request.",
});

export function formsSettingsUrl(workspaceId: string, path: string): string {
  return `${FORMS_API_BASE}/workspaces/${encodeURIComponent(workspaceId)}/settings${path}`;
}

function formsCallUrl(call: FormsCall): string {
  if (call.area === "forms") return `${FORMS_API_BASE}/workspaces/${encodeURIComponent(call.workspaceId)}/forms${call.path}`;
  return formsSettingsUrl(call.workspaceId, call.path);
}

export function formsQuery<T>(
  call: FormsCall,
  queryApi: BaseQueryApi,
  extra: ExtraOptions,
  baseQuery: AppBaseQuery,
): Promise<Result<T>> {
  return client.query<T>(
    { workspaceId: call.workspaceId, url: formsCallUrl(call), method: call.method, body: call.body },
    queryApi,
    extra,
    baseQuery,
  );
}
