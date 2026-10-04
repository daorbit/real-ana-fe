import classes from "./CompareStart.module.css";

const ROWS = [
  { name: "competitor-one.com", score: 84, you: false },
  { name: "you", score: 78, you: true },
  { name: "competitor-two.com", score: 71, you: false },
];

const GAPS = ["Pricing table", "FAQ schema", "Customer stories", "Comparison chart", "Free trial"];

export function CompareSample({ domain }: { domain: string }) {
  return (
    <section className={classes.sample} aria-labelledby="compare-sample-title">
      <header className={classes.sampleHead}>
        <div>
          <h3 id="compare-sample-title" className={classes.sampleTitle}>What a comparison shows you</h3>
          <p className={classes.sampleSub}>Example data — yours appears here once a competitor is tracked.</p>
        </div>
        <span className={classes.sampleBadge}>Example</span>
      </header>

      <div className={classes.sampleBody} aria-hidden>
        <div className={classes.samplePane}>
          <span className={classes.paneLabel}>Standings</span>
          <div className={classes.rows}>
            {ROWS.map((row, i) => (
              <div key={row.name} className={classes.row} data-you={row.you || undefined}>
                <span className={classes.rank}>{i + 1}</span>
                <span className={classes.rowName}>{row.you ? domain || "your-site.com" : row.name}</span>
                <span className={classes.rowTrack}>
                  <span className={classes.rowFill} data-score={row.score} />
                </span>
                <span className={classes.rowScore}>{row.score}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={classes.samplePane}>
          <span className={classes.paneLabel}>Topics they cover that you don't</span>
          <div className={classes.gaps}>
            {GAPS.map((gap) => (
              <span key={gap} className={classes.gap}>{gap}</span>
            ))}
          </div>
          <span className={classes.paneLabel}>Next best fix</span>
          <div className={classes.fix}>
            <span className={classes.fixDot} />
            <span className={classes.fixLines}>
              <span className={classes.line} data-width="most" />
              <span className={classes.line} data-width="half" />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
