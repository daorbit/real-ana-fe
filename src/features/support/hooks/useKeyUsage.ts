import { useMemo } from "react";
import { useGetApiKeyUsageQuery } from "@/app/store";
import type { ApiKeyUsageEntry, ApiKeyUsageWindow } from "@/shared/types";
import { percentDelta, usageDayLabel } from "../developers";

export type UsagePoint = {
  date: string;
  label: string;
  requests: number;
  failures: number;
  successful: number;
};

export function useKeyUsage(workspaceId: string, windowDays: ApiKeyUsageWindow, focusKeyId: string | null) {
  const { data, isLoading, isFetching, isError, refetch } = useGetApiKeyUsageQuery(
    { workspaceId, days: windowDays },
    { skip: !workspaceId },
  );

  const byKey = useMemo(
    () => new Map<string, ApiKeyUsageEntry>((data?.keys ?? []).map((k) => [k.keyId, k])),
    [data],
  );

  const view = useMemo(() => {
    if (!data) return null;
    const focus = focusKeyId ? byKey.get(focusKeyId) : undefined;

    const points: UsagePoint[] = data.days.map((day, i) => {
      const requests = focusKeyId ? (focus?.series.requests[i] ?? 0) : day.requests;
      const failures = focusKeyId ? (focus?.series.failures[i] ?? 0) : day.failures;
      return {
        date: day.date,
        label: usageDayLabel(day.date),
        requests,
        failures,
        successful: Math.max(0, requests - failures),
      };
    });

    const totals = points.reduce(
      (sum, p) => ({ requests: sum.requests + p.requests, failures: sum.failures + p.failures }),
      { requests: 0, failures: 0 },
    );
    const previous = focusKeyId ? (focus?.previous ?? { requests: 0, failures: 0 }) : data.previous;

    return {
      points,
      totals,
      requestsDelta: percentDelta(totals.requests, previous.requests),
      failuresDelta: percentDelta(totals.failures, previous.failures),
    };
  }, [data, byKey, focusKeyId]);

  return {
    view,
    byKey,
    isLoading,
    isFetching,
    loadFailed: isError && !data,
    retry: refetch,
  };
}
