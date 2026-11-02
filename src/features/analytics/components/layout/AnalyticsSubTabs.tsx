import type { AnalyticsTab } from "./analyticsSections";
import classes from "./AnalyticsLayout.module.css";

export function AnalyticsSubTabs({
  label,
  tabs,
  active,
  onChange,
}: {
  label: string;
  tabs: AnalyticsTab[];
  active: string;
  onChange: (value: string) => void;
}) {
  if (!tabs.length) return null;
  const current = tabs.find((tab) => tab.value === active) ?? tabs[0];

  return (
    <div className={classes.subRow}>
      <div className={classes.subtabs} role="tablist" aria-label={`${label} views`}>
        {tabs.map((tab) => {
          const on = tab.value === active;
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
              {tab.label}
            </button>
          );
        })}
      </div>
      <p className={classes.intro}>{current.intro}</p>
    </div>
  );
}
