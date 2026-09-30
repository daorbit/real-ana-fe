import { useCallback, useEffect, useState } from "react";
import { useActiveBilling } from "@/features/workspace/context";
import type { Dashboard, DashboardRange } from "@/features/dashboards/types";

export function useDashboardRange(
  dashboard: Dashboard | undefined,
  canEdit: boolean,
  persist: (range: DashboardRange) => void,
) {
  const billing = useActiveBilling();
  const [local, setLocal] = useState<DashboardRange | null>(null);

  useEffect(() => setLocal(null), [dashboard?.id]);

  const allowed = useCallback(
    (range: DashboardRange) => !billing?.allowedRanges || billing.allowedRanges.includes(range as never),
    [billing]
  );

  const chosen = local ?? dashboard?.range ?? "7d";
  const effective: DashboardRange = allowed(chosen) ? chosen : "24h";

  const change = (range: DashboardRange) => {
    setLocal(range);
    if (canEdit && dashboard && range !== dashboard.range) persist(range);
  };

  return { range: effective, chosen, limited: effective !== chosen, allowed, change };
}
