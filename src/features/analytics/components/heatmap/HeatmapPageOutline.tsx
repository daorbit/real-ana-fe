import classes from "@/features/analytics/components/heatmap/PageHeatmap.module.css";

export function HeatmapPageOutline({ title }: { title: string }) {
  return (
    <div className={classes.outline} aria-hidden>
      <div className={classes.outlineNav}>
        <span className={classes.sk} data-size="logo" />
        <span className={classes.outlineLinks}>
          <span className={classes.sk} data-size="link" />
          <span className={classes.sk} data-size="link" />
          <span className={classes.sk} data-size="pill" />
        </span>
      </div>
      <div className={classes.outlineHero}>
        <span className={classes.outlineTitle}>{title}</span>
        <span className={classes.sk} data-size="line" />
        <span className={classes.sk} data-size="lineShort" />
        <span className={classes.outlineCtas}>
          <span className={classes.sk} data-size="cta" />
          <span className={classes.sk} data-size="ctaGhost" />
        </span>
      </div>
      <div className={classes.outlineCards}>
        <span className={classes.sk} data-size="card" />
        <span className={classes.sk} data-size="card" />
        <span className={classes.sk} data-size="card" />
      </div>
      <span className={classes.sk} data-size="block" />
    </div>
  );
}
