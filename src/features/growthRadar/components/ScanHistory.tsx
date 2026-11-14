import { Tooltip } from "@mantine/core";
import { PanelSkeleton } from "@/shared/ui/Skeletons";
import { dateTime } from "@/shared/lib/format";
import { useRadarScans } from "../hooks/useRadarData";
import { SCAN_HELP, SCAN_STATUS_HELP } from "../lib/help";
import type { RadarScan } from "../types";
import { SectionHeader } from "./SectionHeader";
import classes from "./GrowthRadar.module.css";
import rows from "./Rows.module.css";

const TRIGGER: Record<RadarScan["trigger"], string> = {
  schedule: "Morning check",
  manual: "Checked on demand",
  first: "First check",
};

const STATUS: Record<RadarScan["status"], { text: string; tone: string }> = {
  ok: { text: "Complete", tone: "good" },
  partial: { text: "Some sources missing", tone: "warn" },
  failed: { text: "Did not finish", tone: "bad" },
};

function summary(scan: RadarScan): string {
  if (scan.status === "failed") return scan.error || "The check could not finish.";
  const parts = [`${scan.found} ${scan.found === 1 ? "finding" : "findings"}`];
  if (scan.created) parts.push(`${scan.created} new`);
  if (scan.reopened) parts.push(`${scan.reopened} came back`);
  return parts.join(", ");
}

export function ScanHistory({ workspaceId }: { workspaceId: string }) {
  const { scans, loading } = useRadarScans(workspaceId, true);
  if (loading) return <PanelSkeleton height={200} />;
  if (!scans?.length) return null;

  return (
    <section className={classes.section}>
      <SectionHeader title="Check log" help={SCAN_HELP} />
      <div className={rows.group}>
        {scans.map((scan) => {
          const status = STATUS[scan.status];
          return (
            <div key={scan.id} className={rows.row}>
              <span className={rows.main}>
                <span className={rows.title}>{TRIGGER[scan.trigger]}</span>
                <span className={rows.meta}>
                  <span>{dateTime(scan.startedAt)}</span>
                  <span>{summary(scan)}</span>
                </span>
              </span>
              <Tooltip label={SCAN_STATUS_HELP[scan.status]} multiline w={260} withArrow>
                <span className={rows.trailing}>
                  <span className={rows.dot} data-tone={status.tone} aria-hidden />
                  {status.text}
                </span>
              </Tooltip>
            </div>
          );
        })}
      </div>
    </section>
  );
}
