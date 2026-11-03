import type { KeyboardEvent, ReactNode } from "react";
import { pageTabId, pageTabPanelId } from "@/shared/ui/pageTabIds";
import classes from "./segmented.module.css";

export type SegmentItem<T extends string> = { value: T; label: ReactNode; title?: string };

const NAV_KEYS = ["ArrowRight", "ArrowLeft", "Home", "End"];

export function SearchSegmented<T extends string>({
  items,
  value,
  onChange,
  label,
  size = "md",
  tabsId,
  className,
}: {
  items: SegmentItem<T>[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  size?: "md" | "sm" | "xs";
  tabsId?: string;
  className?: string;
}) {
  const tabs = Boolean(tabsId);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!tabs || !NAV_KEYS.includes(e.key)) return;
    e.preventDefault();
    const index = items.findIndex((item) => item.value === value);
    const next =
      e.key === "Home" ? 0
      : e.key === "End" ? items.length - 1
      : e.key === "ArrowRight" ? (index + 1) % items.length
      : (index - 1 + items.length) % items.length;
    onChange(items[next].value);
    document.getElementById(pageTabId(tabsId!, items[next].value))?.focus();
  };

  return (
    <div
      className={`${classes.seg} ${className ?? ""}`}
      data-size={size}
      role={tabs ? "tablist" : "radiogroup"}
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {items.map((item) => {
        const on = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            className={classes.item}
            data-on={on || undefined}
            title={item.title}
            role={tabs ? "tab" : "radio"}
            aria-selected={tabs ? on : undefined}
            aria-checked={tabs ? undefined : on}
            id={tabs ? pageTabId(tabsId!, item.value) : undefined}
            aria-controls={tabs ? pageTabPanelId(tabsId!, item.value) : undefined}
            tabIndex={tabs && !on ? -1 : 0}
            onClick={() => onChange(item.value)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
