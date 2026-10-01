import { useEffect, useState } from "react";
import {
  useCreateEmbedMutation, useGetEmbedsQuery, useUpdateEmbedMutation,
} from "@/features/dashboards/api";
import { WIDGET_MAP } from "@/features/analytics/widgetCatalog";
import { errMessage, notify, notifyError } from "@/shared/lib/notify";
import type { WidgetId } from "@/features/analytics/widgetCatalog";
import type { DashboardRange, EmbedInput, EmbedTheme } from "@/features/dashboards/types";

export type EmbedDraft = { name: string; widget: WidgetId; range: DashboardRange; theme: EmbedTheme; sites: string[] };

type Draft = EmbedDraft;

export function useEmbedEditor({
  workspaceId,
  opened,
  embedId,
  initialWidget,
  initialRange,
}: {
  workspaceId: string;
  opened: boolean;
  embedId: string | null;
  initialWidget: WidgetId | null;
  initialRange?: DashboardRange;
}) {
  const { data: embeds = [] } = useGetEmbedsQuery(workspaceId, { skip: !opened });
  const [create, { isLoading: creating }] = useCreateEmbedMutation();
  const [update] = useUpdateEmbedMutation();
  const [currentId, setCurrentId] = useState<string | null>(embedId);
  const [draft, setDraft] = useState<Draft>({
    name: "", widget: "visitors", range: "30d", theme: "auto", sites: [],
  });

  const embed = embeds.find((e) => e.id === currentId) ?? null;

  useEffect(() => {
    if (!opened) return;
    setCurrentId(embedId);
    const widget = initialWidget ?? "visitors";
    setDraft({
      name: WIDGET_MAP[widget]?.label ?? "Widget",
      widget,
      range: initialRange ?? "30d",
      theme: "auto",
      sites: [],
    });
  }, [opened, embedId, initialWidget, initialRange]);

  useEffect(() => {
    if (!embed) return;
    setDraft({ name: embed.name, widget: embed.widget, range: embed.range, theme: embed.theme, sites: embed.sites });
  }, [embed]);

  const change = async (patch: Partial<Draft>) => {
    setDraft((d) => ({ ...d, ...patch }));
    if (!embed) return;
    try {
      await update({ workspaceId, id: embed.id, ...(patch as EmbedInput) }).unwrap();
    } catch (e) {
      notify.error(errMessage(e, "Could not update the embed."));
    }
  };

  const setWidget = (widget: WidgetId) =>
    setDraft((d) => ({
      ...d,
      widget,
      name: d.name === (WIDGET_MAP[d.widget]?.label ?? "") ? WIDGET_MAP[widget]?.label ?? d.name : d.name,
    }));

  const submit = async () => {
    try {
      const created = await create({ workspaceId, ...draft, name: draft.name.trim() || WIDGET_MAP[draft.widget]?.label }).unwrap();
      setCurrentId(created.id);
      notify.success("Embed created. Copy the code below.", "Embeds");
    } catch (e) {
      notifyError(e, "Could not create the embed.");
    }
  };

  return { embed, draft, setDraft, setWidget, change, submit, creating };
}
