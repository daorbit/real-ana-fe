import type { CSSProperties } from "react";
import { Tooltip } from "@mantine/core";
import type { LiveAudience } from "@/shared/types";
import { audienceSegments } from "./audienceMeta";
import classes from "./LiveAudience.module.css";

export function AudienceSummary({ audience }: { audience: LiveAudience }) {
  const segments = audienceSegments(audience);
  const [interacting, viewing] = segments;
  const nonHuman = audience.bots + audience.suspect;
  const nonHumanHint = segments
    .slice(2)
    .filter((s) => s.value > 0)
    .map((s) => `${s.value} ${s.label.toLowerCase()}`)
    .join(", ");

  return (
    <div className={classes.heroBreakdown}>
      <div className={classes.summary}>
        {[interacting, viewing].map((s) => (
          <Tooltip key={s.key} label={s.hint} withArrow multiline w={260}>
            <span className={classes.summaryItem}>
              <span className={classes.dot} style={{ "--seg": s.color } as CSSProperties} />
              <b>{s.value}</b> {s.label.toLowerCase()}
            </span>
          </Tooltip>
        ))}
        <Tooltip
          label={nonHuman > 0 ? `Not counted as people: ${nonHumanHint}.` : "No bots or AI agents on the site right now."}
          withArrow
          multiline
          w={260}
        >
          <span className={classes.summaryItem}>
            <span className={classes.dot} style={{ "--seg": "var(--mantine-color-violet-5)" } as CSSProperties} />
            <b>{nonHuman}</b> {nonHuman === 1 ? "bot" : "bots"} &amp; AI not counted
          </span>
        </Tooltip>
      </div>
    </div>
  );
}
