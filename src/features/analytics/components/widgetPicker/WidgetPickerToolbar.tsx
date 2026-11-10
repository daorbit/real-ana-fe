import { CloseButton, TextInput, UnstyledButton } from "@mantine/core";
import { Search } from "lucide-react";
import { WIDGETS, WIDGET_GROUPS } from "@/features/analytics/widgetCatalog";
import type { WidgetId } from "@/features/analytics/widgetCatalog";
import classes from "@/features/analytics/components/widgetPicker/WidgetPicker.module.css";

export type GroupFilter = "All" | (typeof WIDGET_GROUPS)[number];

const FILTERS: GroupFilter[] = ["All", ...WIDGET_GROUPS];

export function WidgetPickerToolbar({
  query,
  onQuery,
  group,
  onGroup,
  has,
}: {
  query: string;
  onQuery: (q: string) => void;
  group: GroupFilter;
  onGroup: (g: GroupFilter) => void;
  has: (id: WidgetId) => boolean;
}) {
  const countOn = (g: GroupFilter) =>
    WIDGETS.filter((w) => (g === "All" || w.group === g) && has(w.id)).length;

  return (
    <div className={classes.toolbar}>
      <TextInput
        placeholder="Search widgets…"
        value={query}
        onChange={(e) => onQuery(e.currentTarget.value)}
        leftSection={<Search size={15} />}
        rightSection={query ? <CloseButton size="sm" aria-label="Clear search" onClick={() => onQuery("")} /> : null}
      />
      <div className={classes.chips} role="tablist" aria-label="Widget groups">
        {FILTERS.map((g) => {
          const on = countOn(g);
          return (
            <UnstyledButton
              key={g}
              role="tab"
              aria-selected={group === g}
              className={classes.chip}
              data-active={group === g || undefined}
              onClick={() => onGroup(g)}
            >
              {g}
              {on > 0 && <span className={classes.chipCount}>{on}</span>}
            </UnstyledButton>
          );
        })}
      </div>
    </div>
  );
}
