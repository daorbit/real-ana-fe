import { useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import { useGetSearchInsightsQuery, useGetSearchPerformanceQuery } from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { demoSearchInsights, demoSearchPerformance } from "@/features/demo/demoSearchConsole";
import type { SearchSource } from "@/features/searchConsole/widgets/useSearchWidgetSource";

export type SearchFailure = { kind: "upgrade" | "error"; message: string };

function failureOf(error: FetchBaseQueryError | SerializedError | undefined): SearchFailure | null {
  if (!error) return null;
  const status = "status" in error ? error.status : null;
  const message = "data" in error ? (error.data as { error?: string } | undefined)?.error : undefined;
  if (status === 402) return { kind: "upgrade", message: message ?? "Your plan doesn't include this Search data." };
  return { kind: "error", message: message ?? "Google didn't respond. Try again in a moment." };
}

function argsOf(source: SearchSource) {
  return source.kind === "ready"
    ? { workspaceId: source.workspaceId, siteId: source.siteId, days: source.days, type: "web" as const }
    : skipToken;
}

export function useSearchPerformanceData(source: SearchSource) {
  const { data: realData, isLoading, isFetching, error, refetch } = useGetSearchPerformanceQuery(argsOf(source));
  const { demo } = useDemo();
  const sample = useMemo(
    () => (demo && source.kind === "ready" ? demoSearchPerformance(source.days) : null),
    [demo, source],
  );
  const data = sample ?? realData;
  return { data, loading: !sample && (isLoading || (isFetching && !data)), failure: sample ? null : failureOf(error), retry: refetch };
}

export function useSearchInsightsData(source: SearchSource) {
  const { data: realData, isLoading, isFetching, error, refetch } = useGetSearchInsightsQuery(argsOf(source));
  const { demo } = useDemo();
  const sample = useMemo(
    () => (demo && source.kind === "ready" ? demoSearchInsights(source.days) : null),
    [demo, source],
  );
  const data = sample ?? realData;
  return { data, loading: !sample && (isLoading || (isFetching && !data)), failure: sample ? null : failureOf(error), retry: refetch };
}
