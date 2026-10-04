import { useEffect, useRef, type KeyboardEvent } from "react";
import type { LucideIcon } from "lucide-react";
import { useStuck } from "@/shared/lib/useStuck";
import { pageTabId, pageTabPanelId } from "./pageTabIds";
import classes from "./PageTabs.module.css";

export type PageTabItem<T extends string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
  count?: number;
  alarm?: boolean;
};

const NAV_KEYS = ["ArrowRight", "ArrowLeft", "Home", "End"];

export function PageTabs<T extends string>({
  items,
  active,
  onChange,
  label,
  idPrefix,
}: {
  items: PageTabItem<T>[];
  active: T;
  onChange: (id: T) => void;
  label: string;
  idPrefix: string;
}) {
  const bar = useRef<HTMLDivElement>(null);
  const { sentinel, stuck } = useStuck();

  useEffect(() => {
    const el = bar.current?.querySelector<HTMLElement>("[data-active]");
    if (!el || !bar.current) return;
    const { offsetLeft, offsetWidth } = el;
    const { scrollLeft, clientWidth } = bar.current;
    if (offsetLeft < scrollLeft || offsetLeft + offsetWidth > scrollLeft + clientWidth) {
      bar.current.scrollTo({ left: offsetLeft - 12, behavior: "smooth" });
    }
  }, [active]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!NAV_KEYS.includes(e.key)) return;
    e.preventDefault();
    const index = items.findIndex((item) => item.id === active);
    const next =
      e.key === "Home" ? 0
      : e.key === "End" ? items.length - 1
      : e.key === "ArrowRight" ? (index + 1) % items.length
      : (index - 1 + items.length) % items.length;
    const id = items[next].id;
    onChange(id);
    document.getElementById(pageTabId(idPrefix, id))?.focus();
  };

  return (
    <>
      <div ref={sentinel} className={classes.anchor} aria-hidden />
      <div className={classes.tabbarWrap} data-stuck={stuck || undefined}>
        <div ref={bar} className={classes.tabbar} role="tablist" aria-label={label} onKeyDown={onKeyDown}>
          {items.map(({ id, label: text, icon: Icon, count, alarm }) => {
            const on = id === active;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={pageTabId(idPrefix, id)}
                aria-selected={on}
                aria-controls={pageTabPanelId(idPrefix, id)}
                tabIndex={on ? 0 : -1}
                data-active={on || undefined}
                className={classes.tab}
                onClick={() => onChange(id)}
              >
                {Icon && <Icon size={15} strokeWidth={on ? 2.2 : 1.9} />}
                {text}
                {count !== undefined && count > 0 && (
                  <span className={classes.count} data-alarm={alarm || undefined}>
                    {count}
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
