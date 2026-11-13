import { dateTime } from "@/shared/lib/format";
import { SECTION_HELP } from "../../lib/help";
import type { OpportunityDetail } from "../../types";
import { Panel } from "./Panel";
import classes from "../Opportunity.module.css";

const SHOWN = 12;

const SYSTEM_COPY: Record<string, string> = {
  detected: "Growth Radar found this",
  reopened: "Seen again after it was closed",
  cleared: "Not seen in the latest check",
  archived: "Archived after 14 days without being seen",
};

function line(entry: OpportunityDetail["activity"][number]): string {
  if (!entry.actor) return SYSTEM_COPY[entry.kind] ?? entry.detail;
  const who = entry.actor.name || "Someone";
  if (entry.kind === "action") return `${who} recorded a change: ${entry.detail}`;
  return `${who}: ${entry.detail}`;
}

export function ActivityLog({ activity }: { activity: OpportunityDetail["activity"] }) {
  if (!activity.length) return null;
  return (
    <Panel id="radar-activity" title="Activity" help={SECTION_HELP.activity}>
      <ul className={classes.log}>
        {activity.slice(0, SHOWN).map((entry, i) => (
          <li key={`${entry.at}-${i}`} className={classes.logItem}>
            <span>{line(entry)}</span>
            <span className={classes.logWhen}>{dateTime(entry.at)}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
