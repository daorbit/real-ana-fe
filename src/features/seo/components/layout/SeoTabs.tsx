import { useEffect, useRef, useState } from "react";
import { Anchor } from "@mantine/core";
import { SEO_TABS, type SeoSubId, type SeoTab, type SeoTabId } from "../sections";
import classes from "./SeoLayout.module.css";

export type SeoTabCount = { value: number; alarm?: boolean };

interface Props {
  active: SeoTabId;
  counts: Partial<Record<SeoTabId, SeoTabCount>>;
  onChange: (id: SeoTabId) => void;
}

/** The report's six tabs, in one row that stays pinned while the page scrolls. */
export function SeoTabs({ active, counts, onChange }: Props) {
  const bar = useRef<HTMLDivElement>(null);
  const sentinel = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  // The bar only takes a background while it is pinned; at rest the page
  // background runs behind it. A 1px marker just above it leaves the top of
  // the scroll area at the moment the bar pins.
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const root = el.closest<HTMLElement>(".app-panel__scroll");
    const io = new IntersectionObserver(
      ([entry]) => {
        const top = entry.rootBounds?.top ?? 0;
        setStuck(!entry.isIntersecting && entry.boundingClientRect.top < top);
      },
      { root, threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // On a narrow screen the row scrolls sideways; keep the active tab in view.
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
    <div className={classes.tabbarWrap} data-stuck={stuck || undefined}>
    <div ref={bar} className={classes.tabbar} role="tablist" aria-label="SEO report">
      {SEO_TABS.map((t) => {
        const c = counts[t.id];
        const on = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`seo-tab-${t.id}`}
            aria-selected={on}
            aria-controls={`seo-panel-${t.id}`}
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
    </div>
    </>
  );
}

/** The line under the tab bar: what this tab is for, and jump links to its blocks. */
export function SeoTabIntro({
  tab,
  onHelp,
  onJump,
}: {
  tab: SeoTab;
  onHelp: () => void;
  onJump: (id: SeoSubId) => void;
}) {
  return (
    <div className={classes.intro}>
      <p className={classes.introText}>
        {tab.description}{" "}
        <Anchor component="button" type="button" size="sm" onClick={onHelp} className={classes.learnMore}>
          Learn more
        </Anchor>
      </p>
      {tab.subs && (
        <nav className={classes.jumps} aria-label={`${tab.label} sections`}>
          {tab.subs.map((s) => (
            <button key={s.id} type="button" className={classes.jump} onClick={() => onJump(s.id)}>
              {s.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
