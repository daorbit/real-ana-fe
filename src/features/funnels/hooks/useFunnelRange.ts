import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { RangeState } from "@/features/analytics/components/RangePicker";

const DEFAULT_RANGE = "7d";

export function useFunnelRange() {
  const [params, setParams] = useSearchParams();
  const preset = params.get("range") ?? DEFAULT_RANGE;
  const from = params.get("from") ?? undefined;
  const to = params.get("to") ?? undefined;
  const compare = params.get("compare") !== "0";

  const range = useMemo<RangeState>(
    () => (preset === "custom" && from && to ? { preset, from, to } : { preset: preset === "custom" ? DEFAULT_RANGE : preset }),
    [preset, from, to],
  );

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          for (const [key, value] of Object.entries(patch)) {
            if (value === null) next.delete(key);
            else next.set(key, value);
          }
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );

  const setRange = useCallback(
    (next: RangeState) =>
      update({
        range: next.preset === DEFAULT_RANGE ? null : next.preset,
        from: next.preset === "custom" ? (next.from ?? null) : null,
        to: next.preset === "custom" ? (next.to ?? null) : null,
      }),
    [update],
  );

  const setCompare = useCallback((on: boolean) => update({ compare: on ? null : "0" }), [update]);

  return { range, setRange, compare, setCompare, search: params.toString() };
}

export function withSearch(pathname: string, search: string): string {
  return search ? `${pathname}?${search}` : pathname;
}
