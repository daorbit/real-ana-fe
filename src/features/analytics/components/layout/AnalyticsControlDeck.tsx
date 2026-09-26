import { useEffect, useRef, type ReactNode } from "react";
import { Loader } from "@mantine/core";
import { useStuck } from "@/shared/lib/useStuck";
import type { AnalyticsSection } from "./analyticsSections";
import classes from "./AnalyticsLayout.module.css";

export function AnalyticsControlDeck({
  controls,
  updating,
  chips,
  sections,
  active,
  onSection,
}: {
  controls: ReactNode;
  updating: boolean;
  chips: ReactNode;
  sections: AnalyticsSection[];
  active: string;
  onSection: (value: string) => void;
}) {
  const { sentinel, stuck } = useStuck();
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
    <>
      <div ref={sentinel} className={classes.anchor} aria-hidden />
      <div className={classes.deck} data-stuck={stuck || undefined}>
        <div className={classes.bar}>
          <div ref={bar} className={classes.tabbar} role="tablist" aria-label="Analytics sections">
            {sections.map((s) => {
              const on = s.value === active;
              const Icon = s.icon;
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
                  <Icon size={15} />
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className={`${classes.controls} an-range`}>
            {updating && <Loader size={14} color="emerald" type="oval" aria-label="Updating" />}
            {controls}
          </div>
        </div>

        {chips && <div className={classes.chips}>{chips}</div>}
      </div>
    </>
  );
}
