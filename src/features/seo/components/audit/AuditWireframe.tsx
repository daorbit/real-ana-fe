import { ClipboardCheck } from "lucide-react";
import classes from "./AuditScan.module.css";

function Tag({ label, spot }: { label: string; spot: string }) {
  return (
    <span className={classes.tag} data-spot={spot}>
      {label}
    </span>
  );
}

export function AuditWireframe({ phase }: { phase: number }) {
  return (
    <div className={classes.page} data-phase={phase}>
      <div className={classes.beam} />

      <div className={`${classes.block} ${classes.nav}`} data-zone="tech">
        <span className={classes.logo} />
        <span className={classes.links}>
          <i />
          <i />
          <i />
        </span>
      </div>

      <div className={`${classes.block} ${classes.h1}`} data-zone="meta" />
      <div className={`${classes.block} ${classes.h1Short}`} data-zone="meta" />
      <div className={`${classes.block} ${classes.line}`} />
      <div className={`${classes.block} ${classes.lineShort}`} />

      <div className={`${classes.block} ${classes.hero}`} data-zone="perf">
        <span className={classes.heroGlyph} />
      </div>

      <div className={classes.cards}>
        <div className={`${classes.block} ${classes.card}`} data-zone="perf" />
        <div className={`${classes.block} ${classes.card}`} />
        <div className={`${classes.block} ${classes.card}`} data-zone="tech" />
      </div>

      <Tag label="<title>" spot="title" />
      <Tag label="H1" spot="h1" />
      <Tag label="meta" spot="meta" />
      <Tag label="canonical" spot="canonical" />
      <Tag label="robots" spot="robots" />
      <Tag label="LCP" spot="lcp" />
      <Tag label="CLS" spot="cls" />

      <div className={classes.scoreRing} aria-hidden="true">
        <svg viewBox="0 0 64 64" className={classes.ring}>
          <circle className={classes.ringTrack} cx="32" cy="32" r="27" />
          <circle className={classes.ringArc} cx="32" cy="32" r="27" />
        </svg>
        <ClipboardCheck size={20} className={classes.ringIcon} />
      </div>
    </div>
  );
}
