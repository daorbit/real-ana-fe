import { useCallback } from "react";
import { useActiveBilling } from "@/features/workspace/context";
import type { DashboardRange } from "@/features/dashboards/types";

export function useRangeAllowed() {
  const billing = useActiveBilling();
  return useCallback(
    (range: DashboardRange) => !billing?.allowedRanges || billing.allowedRanges.includes(range as never),
    [billing]
  );
}
