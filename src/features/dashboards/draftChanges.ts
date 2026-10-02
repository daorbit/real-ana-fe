import { WIDGET_MAP } from "@/features/analytics/widgetCatalog";
import type { DashboardDraft } from "@/features/dashboards/types";

export type DraftChangeKind = "add" | "remove" | "edit";

export type DraftChange = { kind: DraftChangeKind; label: string; widget?: string };

const labelOf = (id: string) => WIDGET_MAP[id]?.label ?? id;

export function draftChanges(base: DashboardDraft | undefined, next: DashboardDraft): DraftChange[] {
  if (!base) return [];
  const before = new Map(base.layout.map((p) => [p.id, p.span]));
  const after = new Map(next.layout.map((p) => [p.id, p.span]));
  const changes: DraftChange[] = [];

  for (const p of next.layout) {
    if (!before.has(p.id)) changes.push({ kind: "add", label: labelOf(p.id), widget: p.id });
  }
  for (const p of base.layout) {
    if (!after.has(p.id)) changes.push({ kind: "remove", label: labelOf(p.id), widget: p.id });
  }
  for (const p of next.layout) {
    const span = before.get(p.id);
    if (span !== undefined && span !== p.span) {
      changes.push({ kind: "edit", label: `${labelOf(p.id)} ${span} → ${p.span} cols`, widget: p.id });
    }
  }

  const kept = next.layout.filter((p) => before.has(p.id)).map((p) => p.id);
  const keptBefore = base.layout.filter((p) => after.has(p.id)).map((p) => p.id);
  if (kept.join() !== keptBefore.join()) changes.push({ kind: "edit", label: "Reordered widgets" });

  if (next.name !== base.name) changes.push({ kind: "edit", label: `Renamed to “${next.name}”` });
  if (next.range !== base.range) changes.push({ kind: "edit", label: `Range ${base.range} → ${next.range}` });
  if (next.description !== base.description && next.name === base.name) {
    changes.push({ kind: "edit", label: "New description" });
  }

  return changes;
}

export function addedWidgets(base: DashboardDraft | undefined, next: DashboardDraft): string[] {
  if (!base) return next.layout.map((p) => p.id);
  const before = new Set(base.layout.map((p) => p.id));
  return next.layout.filter((p) => !before.has(p.id)).map((p) => p.id);
}
