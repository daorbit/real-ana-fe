import type { FunnelReport } from "@/shared/types";
import { FunnelResults } from "./FunnelResults";
import classes from "./Funnels.module.css";

export function FunnelPreview({
  report,
  running,
  ready,
  rangeLabel,
}: {
  report: FunnelReport | null;
  running: boolean;
  ready: boolean;
  rangeLabel: string;
}) {
  return (
    <section className={classes.preview} aria-labelledby="funnel-preview-title">
      <header className={classes.previewHead}>
        <h2 id="funnel-preview-title" className={classes.previewTitle}>
          Preview
        </h2>
        <span className={classes.previewSub}>{rangeLabel} · updates as you pick steps</span>
      </header>
      {report ? (
        <FunnelResults report={report} running={running} showTable={false} />
      ) : (
        <p className={classes.previewEmpty}>
          {ready || running ? "Counting sessions…" : "Pick at least two steps to see how many visitors make it through."}
        </p>
      )}
    </section>
  );
}
