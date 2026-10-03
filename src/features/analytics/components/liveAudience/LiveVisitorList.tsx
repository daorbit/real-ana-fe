import type { CSSProperties } from "react";
import { Badge, Tooltip } from "@mantine/core";
import { CountryFlag } from "@/shared/ui/CountryFlag";
import { timeAgo } from "@/shared/lib/format";
import type { LiveAudience } from "@/shared/types";
import { audienceSegments, SIGNAL_LABEL, visitorSegment } from "./audienceMeta";
import classes from "./LiveAudience.module.css";

const MAX_ROWS = 12;

export function LiveVisitorList({ audience }: { audience: LiveAudience }) {
  const segments = new Map(audienceSegments(audience).map((s) => [s.key, s]));
  const rows = audience.visitors.slice(0, MAX_ROWS);

  return (
    <div className={classes.list}>
      {rows.map((v) => {
        const seg = segments.get(visitorSegment(v));
        const reasons = v.signals.map((s) => SIGNAL_LABEL[s] ?? s);
        const label = v.kind === "human" ? seg?.singular : v.name || seg?.singular;
        return (
          <div key={v.id} className={classes.visitor}>
            <CountryFlag code={v.country} size={16} />
            <div className={classes.visitorMain}>
              <div className={classes.visitorPath}>{v.path}</div>
              <div className={classes.visitorMeta}>
                {v.browser} · {v.os} · {v.device} · {timeAgo(v.lastSeen)}
              </div>
            </div>
            <Tooltip
              label={reasons.length ? reasons.join(" · ") : seg?.hint}
              withArrow
              multiline
              w={260}
            >
              <Badge
                size="sm"
                variant="light"
                radius="sm"
                color="gray"
                leftSection={<span className={classes.dot} style={{ "--seg": seg?.color } as CSSProperties} />}
              >
                {label}
              </Badge>
            </Tooltip>
          </div>
        );
      })}
    </div>
  );
}
