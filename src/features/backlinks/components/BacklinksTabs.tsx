import classes from "./Backlinks.module.css";

export type BacklinksTabId = "links" | "competitors" | "gap" | "how";

const TABS: { id: BacklinksTabId; label: string }[] = [
  { id: "links", label: "Your backlinks" },
  { id: "competitors", label: "Competitor backlinks" },
  { id: "gap", label: "Link gap" },
  { id: "how", label: "How it works" },
];

export function BacklinksTabs({
  active,
  counts,
  onChange,
}: {
  active: BacklinksTabId;
  counts: Partial<Record<BacklinksTabId, { value: number; alarm?: boolean }>>;
  onChange: (id: BacklinksTabId) => void;
}) {
  return (
    <div className={classes.tabbar} role="tablist" aria-label="Backlinks">
      {TABS.map((t) => {
        const c = counts[t.id];
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={on}
            data-active={on || undefined}
            className={classes.tab}
            onClick={() => onChange(t.id)}
          >
            {t.label}
            {c && c.value > 0 && (
              <span className={classes.count} data-alarm={c.alarm || undefined}>
                {c.value}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
