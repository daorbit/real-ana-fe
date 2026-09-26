import { MousePointerClick } from "lucide-react";
import type { AnalyticsTab } from "./analyticsSections";
import classes from "./AnalyticsLayout.module.css";

export function AnalyticsSubTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: AnalyticsTab[];
  active: string;
  onChange: (value: string) => void;
}) {
  if (!tabs.length) return null;

  return (
    <div className={classes.subRow}>
      <div className={classes.subtabs} role="tablist" aria-label="Views">
        {tabs.map((tab) => {
          const on = tab.value === active;
          const Icon = tab.icon;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={on}
              data-active={on || undefined}
              className={classes.subtab}
              onClick={() => onChange(tab.value)}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>
      <span className={classes.tip}>
        <MousePointerClick size={13} />
        Click any row to filter the whole dashboard by it.
      </span>
    </div>
  );
}
