import { Tooltip } from "@mantine/core";
import { Info } from "lucide-react";
import { compact } from "@/shared/lib/format";
import type { BacklinkOverview } from "../types";
import classes from "./Backlinks.module.css";

type Stat = { label: string; value: string; sub: string; hint: string; tone?: "good" | "bad" };

export function SummaryStrip({ summary }: { summary: BacklinkOverview["summary"] }) {
  const stats: Stat[] = [
    {
      label: "Live backlinks",
      value: compact(summary.live),
      sub: summary.newRecently > 0 ? `+${summary.newRecently} in the last 30 days` : `${summary.total} tracked in total`,
      hint: "Links confirmed on the source page at the last check.",
      tone: summary.newRecently > 0 ? "good" : undefined,
    },
    {
      label: "Referring domains",
      value: compact(summary.referringDomains),
      sub: "Distinct sites linking to you",
      hint: "Search engines weigh the number of different sites linking to you more than the raw link count.",
    },
    {
      label: "Follow share",
      value: `${summary.followShare}%`,
      sub: "Of live links pass authority",
      hint: "Share of live links without nofollow, ugc or sponsored. These are the links that help rankings.",
    },
    {
      label: "Lost",
      value: compact(summary.lost),
      sub: summary.lostRecently > 0 ? `${summary.lostRecently} in the last 30 days` : "None recently",
      hint: "Links that were live and have since been removed, or whose page now returns an error.",
      tone: summary.lostRecently > 0 ? "bad" : undefined,
    },
    {
      label: "Opportunities",
      value: compact(summary.opportunities),
      sub: "Domains linking to rivals, not you",
      hint: "Sites that link to at least one competitor you track but not to you. See the Link gap tab.",
    },
  ];

  return (
    <section className={classes.summary}>
      {stats.map((s) => (
        <div key={s.label} className={classes.stat}>
          <span className={classes.statLabel}>
            {s.label}
            <Tooltip label={s.hint} withArrow multiline w={240}>
              <Info size={11} className={classes.infoIcon} />
            </Tooltip>
          </span>
          <div className={classes.statValue} data-tone={s.tone}>
            {s.value}
          </div>
          <div className={classes.statSub}>{s.sub}</div>
        </div>
      ))}
    </section>
  );
}
