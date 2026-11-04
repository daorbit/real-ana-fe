import type { CSSProperties } from "react";
import type { LiveAudience } from "@/shared/types";
import { compact } from "@/shared/lib";
import classes from "./LiveAudience.module.css";

export function LiveStatFooter({ audience, bar = true }: { audience: LiveAudience | null; bar?: boolean }) {
  if (!audience) return <span className={classes.heroNote}>Visitors active in the last 5 minutes</span>;
  const others = audience.bots + audience.suspect;
  const all = audience.humans + others;
  const share = all > 0 ? (audience.humans / all) * 100 : 0;

  return (
    <div className={classes.split}>
      {bar && (
        <div className={classes.splitBar} aria-hidden>
          <span className={classes.splitPeople} style={{ "--share": `${share}%` } as CSSProperties} />
          <span className={classes.splitOthers} />
        </div>
      )}
      <span className={classes.heroNote}>
        {compact(audience.humans)} {audience.humans === 1 ? "person" : "people"} · {compact(others)}{" "}
        {others === 1 ? "bot" : "bots"} filtered out
      </span>
    </div>
  );
}
