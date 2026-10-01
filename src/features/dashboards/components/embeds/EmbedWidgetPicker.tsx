import { useState } from "react";
import { TextInput, UnstyledButton } from "@mantine/core";
import { Search } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { EMBEDDABLE_WIDGETS, WIDGET_GROUPS, WIDGET_MAP } from "@/features/analytics/widgetCatalog";
import { widgetIcon } from "@/features/dashboards/widgetIcons";
import type { WidgetId } from "@/features/analytics/widgetCatalog";
import classes from "@/features/dashboards/components/embeds/Embeds.module.css";

function matches(id: WidgetId, query: string) {
  const q = query.trim().toLowerCase();
  const w = WIDGET_MAP[id];
  return !q || w.label.toLowerCase().includes(q) || w.description.toLowerCase().includes(q);
}

export function EmbedWidgetPicker({ onPick }: { onPick: (id: WidgetId) => void }) {
  const [query, setQuery] = useState("");
  const groups = WIDGET_GROUPS.map((group) => ({
    group,
    items: EMBEDDABLE_WIDGETS.filter((id) => WIDGET_MAP[id].group === group && matches(id, query)),
  })).filter((g) => g.items.length > 0);

  return (
    <div className={classes.picker}>
      <TextInput
        leftSection={<Search size={15} />}
        placeholder="Search widgets"
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        aria-label="Search widgets"
        data-autofocus
      />
      {groups.length === 0 && (
        <EmptyState compact icon={Search} title="No widgets match" description="Try a different word." />
      )}
      {groups.map((g) => (
        <section key={g.group}>
          <div className={classes.groupLabel}>{g.group}</div>
          <div className={classes.pickGrid}>
            {g.items.map((id) => {
              const Icon = widgetIcon(id);
              const w = WIDGET_MAP[id];
              return (
                <UnstyledButton key={id} className={classes.pickTile} onClick={() => onPick(id)}>
                  <span className={classes.pickIcon}><Icon size={17} /></span>
                  <span className={classes.pickText}>
                    <span className={classes.pickName}>{w.label}</span>
                    <span className={classes.pickDesc}>{w.description}</span>
                  </span>
                </UnstyledButton>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
