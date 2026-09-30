import { useCallback, useMemo } from "react";
import { sanitiseLayout, useLayoutDraft } from "@/features/analytics";
import { TEMPLATE_MAP } from "@/features/dashboards/templates";
import { usePatchDashboard } from "@/features/dashboards/hooks/usePatchDashboard";
import type { Dashboard } from "@/features/dashboards/types";

const NONE: never[] = [];

export function useDashboardLayout(workspaceId: string | undefined, dashboard: Dashboard | undefined) {
  const saved = useMemo(() => sanitiseLayout(dashboard?.layout ?? NONE), [dashboard?.layout]);
  const defaults = TEMPLATE_MAP[dashboard?.template ?? "blank"]?.layout ?? NONE;
  const edit = useLayoutDraft(saved, defaults, dashboard?.id);
  const { patch, patching } = usePatchDashboard(workspaceId, dashboard?.id);
  const { draft, revert } = edit;

  const save = useCallback(async () => {
    if (draft === null) return;
    await patch({ layout: draft });
    revert();
  }, [draft, patch, revert]);

  return { ...edit, save, saving: patching, patch, hasDefaults: defaults.length > 0 };
}
