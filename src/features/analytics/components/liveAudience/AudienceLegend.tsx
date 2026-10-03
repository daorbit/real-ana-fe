import type { CSSProperties } from "react";
import { Tooltip } from "@mantine/core";
import type { AudienceSegment } from "./audienceMeta";
import classes from "./LiveAudience.module.css";

export function AudienceLegend({ segments }: { segments: AudienceSegment[] }) {
  return (
    <div className={classes.legend}>
      {segments.map((s) => (
        <Tooltip key={s.key} label={s.hint} withArrow multiline w={260}>
          <div className={classes.legendItem} data-empty={s.value === 0 || undefined}>
            <span className={classes.legendLabel}>
              <span className={classes.dot} style={{ "--seg": s.color } as CSSProperties} />
              {s.label}
            </span>
            <span className={classes.legendValue}>{s.value}</span>
          </div>
        </Tooltip>
      ))}
    </div>
  );
}
