import { useEffect, useRef, type ReactNode } from "react";
import { Loader } from "@mantine/core";
import type { AnalyticsSection } from "./analyticsSections";
import classes from "./AnalyticsLayout.module.css";

export function AnalyticsControlDeck({
  controls,
  updating,
  chips,
  sections,
  active,
  onSection,
  status,
}: {
  controls: ReactNode;
  updating: boolean;
  chips: ReactNode;
  sections: AnalyticsSection[];
  active: string;
  onSection: (value: string) => void;
  status?: ReactNode;
}) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = bar.current?.querySelector<HTMLElement>("[data-active]");
    if (!el || !bar.current) return;
    const { offsetLeft, offsetWidth } = el;
    const { scrollLeft, clientWidth } = bar.current;
    if (offsetLeft < scrollLeft || offsetLeft + offsetWidth > scrollLeft + clientWidth) {
      bar.current.scrollTo({ left: offsetLeft - 12, behavior: "smooth" });
    }
  }, [active]);

  return (
    <div className={classes.deck}>
      <div className={classes.filters}>
        <div className={`${classes.controls} an-range`}>
          {controls}
          {updating && <Loader size={14} color="gray" type="oval" aria-label="Updating" />}
        </div>
        {chips && <div className={classes.chips}>{chips}</div>}
      </div>

      <div className={classes.bar}>
        <div ref={bar} className={classes.tabbar} role="tablist" aria-label="Analytics sections">
          {sections.map((s) => {
            const on = s.value === active;
            return (
              <button
                key={s.value}
                type="button"
                role="tab"
                aria-selected={on}
                data-active={on || undefined}
                className={classes.tab}
                onClick={() => onSection(s.value)}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        {status && <span className={classes.status}>{status}</span>}
      </div>
    </div>
  );
}
