import { Link } from "react-router-dom";
import { Tooltip } from "@mantine/core";
import { timeAgo } from "@/shared/lib/format";
import { SOURCE_ICON, SOURCE_LABEL, SOURCE_STATE_LABEL } from "../lib/labels";
import { SOURCE_HELP, SOURCE_STATE_HELP } from "../lib/help";
import type { RadarSourceId, SourceState, SourceStatus } from "../types";
import { SectionHeader } from "./SectionHeader";
import classes from "./GrowthRadar.module.css";
import rows from "./Rows.module.css";

const SET_UP_PATH: Record<RadarSourceId, string> = {
  analytics: "/app/install",
  leadCapture: "/app/lead-capture",
  bookings: "/app/lead-capture",
  searchConsole: "/app/search-visibility",
};

const TONE: Record<SourceState, string> = { ready: "good", not_connected: "idle", stale: "warn", error: "bad" };

function subtitle(source: SourceStatus): string {
  const fresh = source.state === "ready" && source.freshAt ? `latest data ${timeAgo(source.freshAt)}` : "";
  return [source.detail, fresh].filter(Boolean).join(" · ") || SOURCE_HELP[source.id];
}

export function SourceList({ sources }: { sources: SourceStatus[] }) {
  const ready = sources.filter((s) => s.state === "ready").length;
  return (
    <section className={classes.section}>
      <SectionHeader
        title="Data sources"
        help="A check only runs when the data it needs is connected and recent, so missing data is never read as a drop."
        aside={
          <span className={classes.sectionNote}>
            {ready} of {sources.length} connected
          </span>
        }
      />
      <div className={rows.group}>
        {sources.map((source) => {
          const Icon = SOURCE_ICON[source.id];
          return (
            <div key={source.id} className={rows.row}>
              <Icon size={18} className={rows.leadIcon} aria-hidden />
              <span className={rows.main}>
                <span className={rows.listTitle}>{SOURCE_LABEL[source.id]}</span>
                <span className={rows.subtitle}>{subtitle(source)}</span>
              </span>
              {source.state === "not_connected" ? (
                <Link to={SET_UP_PATH[source.id]} className={rows.action}>
                  Set up
                </Link>
              ) : (
                <Tooltip label={SOURCE_STATE_HELP[source.state]} multiline w={260} withArrow>
                  <span className={rows.trailing}>
                    <span className={rows.dot} data-tone={TONE[source.state]} aria-hidden />
                    {SOURCE_STATE_LABEL[source.state]}
                  </span>
                </Tooltip>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
