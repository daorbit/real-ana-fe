import type { Stats } from "@/shared/types";
import type { Draft } from "./funnelDraft";

export type FunnelPreset = { key: string; label: string; hint: string; steps: Draft[] };

export function funnelPresets(stats: Stats | null): FunnelPreset[] {
  if (!stats) return [];
  const presets: FunnelPreset[] = [];

  const entry = stats.entryPages?.[0]?.key;
  const topPages = (stats.topPages ?? []).map((p) => p.key).filter((p) => p !== entry);
  const events = [...(stats.customEvents ?? [])].sort((a, b) => b.count - a.count);

  if (entry && topPages.length > 0) {
    presets.push({
      key: "landing-depth",
      label: `${entry} → ${topPages[0]}`,
      hint: "Your top landing page into the next page people visit",
      steps: [
        { type: "page", value: entry },
        { type: "page", value: topPages[0] },
      ],
    });
  }

  if (events.length >= 2) {
    presets.push({
      key: "top-events",
      label: `${events[0].key} → ${events[1].key}`,
      hint: "Your two busiest events, in the order they happen",
      steps: [
        { type: "event", value: events[0].key },
        { type: "event", value: events[1].key },
      ],
    });
  }

  if (topPages.length >= 2) {
    const path = topPages.slice(0, 3);
    presets.push({
      key: "top-pages",
      label: path.join(" → "),
      hint: `Your ${path.length} most visited pages, in traffic order`,
      steps: path.map((value) => ({ type: "page" as const, value })),
    });
  }

  return presets;
}
