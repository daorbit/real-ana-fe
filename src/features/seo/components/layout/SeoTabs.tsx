import { Link } from "react-router-dom";
import { Anchor } from "@mantine/core";
import { ArrowUpRight } from "lucide-react";
import { useRegisterHeaderHelp } from "@/shared/lib/headerHelp";
import { seoTabPath, type SeoSubId, type SeoTab } from "../sections";
import classes from "./SeoLayout.module.css";

export type SeoTabCount = { value: number; alarm?: boolean };

export function SeoTabTitle({ tab, count }: { tab: SeoTab; count?: SeoTabCount }) {
  return (
    <span className={classes.tabTitle}>
      {tab.label}
      {count !== undefined && count.value > 0 && (
        <span className={classes.sectionCount} data-alarm={count.alarm || undefined}>
          {count.value}
        </span>
      )}
    </span>
  );
}

export function SeoHelpLink({ onHelp }: { onHelp: () => void }) {
  return (
    <Anchor component="button" type="button" size="sm" onClick={onHelp} className={classes.learnMore}>
      Learn more
    </Anchor>
  );
}

export function SeoTabDescription({ tab, onHelp }: { tab: SeoTab; onHelp: () => void }) {
  return (
    <>
      {tab.description} <SeoHelpLink onHelp={onHelp} />
    </>
  );
}

export function SeoOverviewLink() {
  return (
    <Anchor component={Link} to={seoTabPath("overview")} size="sm" fw={500} className={classes.overviewLink}>
      View overview
      <ArrowUpRight size={14} />
    </Anchor>
  );
}

export function SeoTabIntro({
  tab,
  onHelp,
  onJump,
  showText = true,
}: {
  tab: SeoTab;
  onHelp: () => void;
  onJump: (id: SeoSubId) => void;
  showText?: boolean;
}) {
  useRegisterHeaderHelp(onHelp);
  if (!showText && !tab.subs) return null;

  return (
    <div className={classes.intro}>
      {showText && (
        <p className={classes.introText}>
          <SeoTabDescription tab={tab} onHelp={onHelp} />
        </p>
      )}
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
