import { Anchor } from "@mantine/core";
import { useRegisterHeaderHelp } from "@/shared/lib/headerHelp";
import type { SeoSubId, SeoTab } from "../sections";
import classes from "./SeoLayout.module.css";

export type SeoTabCount = { value: number; alarm?: boolean };

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
