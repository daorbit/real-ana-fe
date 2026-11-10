import { SearchX } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { WIDGETS } from "@/features/analytics/widgetCatalog";
import type { Span, Widget, WidgetId } from "@/features/analytics/widgetCatalog";
import { WidgetPickerCard } from "@/features/analytics/components/widgetPicker/WidgetPickerCard";
import classes from "@/features/analytics/components/widgetPicker/WidgetPicker.module.css";

type Section = { group: string; items: readonly Widget[] };

export function WidgetPickerSections({
  sections,
  query,
  onClearQuery,
  has,
  spanOf,
  toggle,
  setSpan,
}: {
  sections: Section[];
  query: string;
  onClearQuery: () => void;
  has: (id: WidgetId) => boolean;
  spanOf: (id: WidgetId) => Span | undefined;
  toggle: (id: WidgetId) => void;
  setSpan: (id: WidgetId, span: Span) => void;
}) {
  if (sections.length === 0) {
    return (
      <EmptyState
        compact
        icon={SearchX}
        title={`No widgets match “${query}”`}
        description="Try another word, or pick a group above."
        action={{ label: "Clear search", onClick: onClearQuery }}
      />
    );
  }

  return (
    <>
      {sections.map(({ group, items }) => {
        const total = WIDGETS.filter((w) => w.group === group).length;
        const on = items.filter((w) => has(w.id as WidgetId)).length;
        return (
          <section key={group} className={classes.section}>
            <div className={classes.sectionHead}>
              {group}
              <span className={classes.sectionCount}>{query ? `${items.length} of ${total}` : `${on} of ${total} added`}</span>
            </div>
            <div className={classes.masonry}>
              {items.map((w) => {
                const id = w.id as WidgetId;
                return (
                  <WidgetPickerCard
                    key={id}
                    widget={w}
                    active={has(id)}
                    span={spanOf(id) ?? w.defaultSpan}
                    onToggle={() => toggle(id)}
                    onSpan={(s) => setSpan(id, s)}
                  />
                );
              })}
            </div>
          </section>
        );
      })}
    </>
  );
}
