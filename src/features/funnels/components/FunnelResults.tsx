import type { FunnelReport } from "@/shared/types";
import { FunnelChart } from "./FunnelChart";
import { FunnelMetrics } from "./FunnelMetrics";
import { FunnelTable } from "./FunnelTable";
import classes from "./Funnels.module.css";

export function FunnelResults({
  report,
  running,
  showTable = true,
}: {
  report: FunnelReport;
  running: boolean;
  showTable?: boolean;
}) {
  const worstIndex = report.biggestDrop?.index ?? null;
  const nobody = (report.steps[0]?.count ?? 0) === 0;

  return (
    <div className={classes.results} data-running={running || undefined} aria-busy={running || undefined}>
      {nobody && (
        <p className={classes.notice}>No sessions reached step 1 in this range. Try a wider range or a busier first step.</p>
      )}
      <FunnelMetrics report={report} />
      <FunnelChart steps={report.steps} worstIndex={worstIndex} />
      {showTable && <FunnelTable steps={report.steps} worstIndex={worstIndex} comparing={Boolean(report.previous)} />}
    </div>
  );
}
