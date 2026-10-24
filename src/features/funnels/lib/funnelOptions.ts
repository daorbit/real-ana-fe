import type { Stats } from "@/shared/types";
import { encodeStep, type Draft } from "./funnelDraft";

export type StepOption = { value: string; label: string; type: Draft["type"]; count: number | null };

export type StepOptionGroup = { group: string; items: StepOption[] };

function merge(
  type: Draft["type"],
  buckets: { key: string; count: number }[],
  chosen: string[],
): StepOption[] {
  const counts = new Map<string, number>();
  for (const b of buckets) counts.set(b.key, Math.max(counts.get(b.key) ?? 0, b.count));
  for (const value of chosen) if (!counts.has(value)) counts.set(value, -1);
  return [...counts.entries()]
    .filter(([value]) => Boolean(value))
    .sort((a, b) => b[1] - a[1])
    .map(([value, count]) => ({
      value: encodeStep({ type, value })!,
      label: value,
      type,
      count: count < 0 ? null : count,
    }));
}

export function stepOptions(stats: Stats | null, steps: Draft[]): StepOptionGroup[] {
  const chosen = (type: Draft["type"]) => steps.filter((s) => s.type === type && s.value).map((s) => s.value);
  const pages = merge("page", [...(stats?.entryPages ?? []), ...(stats?.topPages ?? [])], chosen("page"));
  const events = merge("event", stats?.customEvents ?? [], chosen("event"));

  const groups: StepOptionGroup[] = [];
  if (pages.length) groups.push({ group: "Pages", items: pages });
  if (events.length) groups.push({ group: "Events", items: events });
  return groups;
}

export function filterOptions(groups: StepOptionGroup[], query: string): StepOptionGroup[] {
  const q = query.trim().toLowerCase();
  if (!q) return groups;
  return groups
    .map((g) => ({ ...g, items: g.items.filter((item) => item.label.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length > 0);
}
