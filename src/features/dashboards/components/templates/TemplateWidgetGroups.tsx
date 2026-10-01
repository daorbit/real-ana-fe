import { WIDGET_MAP } from "@/features/analytics/widgetCatalog";
import { widgetIcon } from "@/features/dashboards/widgetIcons";
import { layoutGroups } from "@/features/dashboards/templates";
import type { Placed } from "@/features/analytics/widgetCatalog";
import classes from "@/features/dashboards/components/templates/Templates.module.css";

export function TemplateWidgetGroups({ layout }: { layout: Placed[] }) {
  return (
    <div className={classes.groups}>
      {layoutGroups(layout).map((g) => (
        <section key={g.group} className={classes.group}>
          <div className={classes.groupHead}>
            {g.group}
            <span className={classes.groupCount}>{g.ids.length}</span>
          </div>
          <ul className={classes.groupItems}>
            {g.ids.map((id) => {
              const Icon = widgetIcon(id);
              return (
                <li key={id} className={classes.groupItem}>
                  <Icon size={14} />
                  {WIDGET_MAP[id]?.label ?? id}
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
