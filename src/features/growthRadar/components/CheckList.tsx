import { Tooltip } from "@mantine/core";
import { DETECTOR_META } from "../lib/labels";
import { CHECK_STATUS_HELP } from "../lib/help";
import type { DetectorRun } from "../types";
import { SectionHeader } from "./SectionHeader";
import classes from "./GrowthRadar.module.css";
import rows from "./Rows.module.css";

function result(run: DetectorRun): { text: string; tone: string } {
  if (run.status === "ran") return run.found ? { text: `${run.found} found`, tone: "accent" } : { text: "Nothing found", tone: "good" };
  if (run.status === "off") return { text: "Off", tone: "idle" };
  if (run.status === "failed") return { text: "Did not finish", tone: "bad" };
  return { text: "Skipped", tone: "warn" };
}

export function CheckList({ runs, onSettings }: { runs: DetectorRun[]; onSettings: () => void }) {
  return (
    <section className={classes.section}>
      <SectionHeader
        title="Checks"
        aside={
          <button type="button" className={classes.seeAll} onClick={onSettings}>
            Adjust
          </button>
        }
      />
      <div className={rows.group}>
        {runs.map((run) => {
          const meta = DETECTOR_META[run.id];
          const { text, tone } = result(run);
          return (
            <div key={run.id} className={rows.row}>
              <span className={rows.main}>
                <span className={rows.listTitle}>{meta.title}</span>
                <span className={rows.subtitle}>{run.reason || meta.summary}</span>
              </span>
              <Tooltip label={CHECK_STATUS_HELP[run.status]} multiline w={240} withArrow>
                <span className={rows.trailing}>
                  <span className={rows.dot} data-tone={tone} aria-hidden />
                  {text}
                </span>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </section>
  );
}
