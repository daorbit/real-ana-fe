import type { BaseQueryApi } from "@reduxjs/toolkit/query";
import {
  createServiceClient,
  type AppBaseQuery,
  type ExtraOptions,
  type Result,
} from "@/features/integrations/lib/serviceClient";
import { INVOICES_APP_BASE } from "./invoicesApp";

const INVOICES_API_BASE = `${INVOICES_APP_BASE.replace(/\/$/, "")}/api`;

interface InvoicesCall {
  workspaceId: string;
  path: string;
  method?: "GET" | "PUT" | "POST" | "DELETE";
  body?: unknown;
}

const client = createServiceClient({
  tokenPath: "invoices-token",
  unreachable: "Could not reach the invoices service.",
  refused: "The invoices service refused the request.",
});

export function invoicesQuery<T>(
  call: InvoicesCall,
  queryApi: BaseQueryApi,
  extra: ExtraOptions,
  baseQuery: AppBaseQuery,
): Promise<Result<T>> {
  return client.query<T>(
    {
      workspaceId: call.workspaceId,
      url: `${INVOICES_API_BASE}/workspaces/${encodeURIComponent(call.workspaceId)}${call.path}`,
      method: call.method,
      body: call.body,
    },
    queryApi,
    extra,
    baseQuery,
  );
}
