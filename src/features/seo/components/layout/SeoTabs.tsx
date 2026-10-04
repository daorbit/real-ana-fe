import { Anchor } from "@mantine/core";
import { PageTabs, type PageTabItem } from "@/shared/ui/PageTabs";
import { SEO_TABS, type SeoSubId, type SeoTab, type SeoTabId } from "../sections";
import classes from "./SeoLayout.module.css";

export type SeoTabCount = { value: number; alarm?: boolean };

interface Props {
  active: SeoTabId;
  counts: Partial<Record<SeoTabId, SeoTabCount>>;
  onChange: (id: SeoTabId) => void;
}

export function SeoTabs({ active, counts, onChange }: Props) {
  const items: PageTabItem<SeoTabId>[] = SEO_TABS.map((t) => ({
    id: t.id,
    label: t.label,
    count: counts[t.id]?.value,
    alarm: counts[t.id]?.alarm,
  }));

  return <PageTabs items={items} active={active} onChange={onChange} label="SEO report" idPrefix="seo" />;
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
