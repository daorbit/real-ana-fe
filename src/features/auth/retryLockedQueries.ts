import type { Dispatch, UnknownAction } from "@reduxjs/toolkit";
import { api } from "@/app/store";

const LOCKED_STATUS = 423;

type CachedQuery = {
  status?: string;
  endpointName?: string;
  originalArgs?: unknown;
  error?: { status?: unknown };
};

type InitiableEndpoint = {
  initiate: (args: unknown, options: { subscribe: boolean; forceRefetch: boolean }) => UnknownAction;
};

export function retryLockedQueries(dispatch: Dispatch, getState: () => unknown): void {
  const state = getState() as Record<string, { queries?: Record<string, CachedQuery | undefined> }>;
  const queries = Object.values(state[api.reducerPath]?.queries ?? {});
  const endpoints = api.endpoints as unknown as Record<string, InitiableEndpoint | undefined>;

  for (const query of queries) {
    if (query?.status !== "rejected" || query.error?.status !== LOCKED_STATUS || !query.endpointName) continue;
    const endpoint = endpoints[query.endpointName];
    if (endpoint) dispatch(endpoint.initiate(query.originalArgs, { subscribe: false, forceRefetch: true }));
  }
}
