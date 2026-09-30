import { useCallback, useMemo } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useGetLayoutQuery, useSaveLayoutMutation } from "@/app/store";
import { useWorkspace } from "@/features/workspace/context";
import { sanitiseLayout, useLayoutDraft } from "@/features/analytics/hooks/useLayoutDraft";
import type { Placed } from "@/features/analytics/widgetCatalog";

export { WIDGETS, WIDGET_GROUPS, WIDGET_MAP } from "@/features/analytics/widgetCatalog";
export type { WidgetKind, Span, Widget, Placed, WidgetId } from "@/features/analytics/widgetCatalog";

const DEFAULTS: Placed[] = [
  { id: "visitors", span: 1 },
  { id: "pageviews", span: 1 },
  { id: "live", span: 1 },
  { id: "sites", span: 1 },
  { id: "traffic", span: 3 },
  { id: "livePages", span: 1 },
  { id: "topPages", span: 2 },
  { id: "topReferrers", span: 2 },
];

export function useHomeWidgets() {
  const { active } = useWorkspace();
  const workspaceId = active?._id;

  const { data, isLoading } = useGetLayoutQuery(workspaceId ?? skipToken);
  const [saveLayout, { isLoading: saving }] = useSaveLayoutMutation();

  const saved = useMemo<Placed[]>(() => {
    if (!data) return DEFAULTS;
    return data.layout === null ? DEFAULTS : sanitiseLayout(data.layout);
  }, [data]);

  const edit = useLayoutDraft(saved, DEFAULTS, workspaceId);
  const { draft, revert } = edit;

  const save = useCallback(async () => {
    if (!workspaceId || draft === null) return;
    await saveLayout({ workspaceId, layout: draft }).unwrap();
    revert();
  }, [workspaceId, draft, saveLayout, revert]);

  return { ...edit, loading: isLoading, saving, save };
}
