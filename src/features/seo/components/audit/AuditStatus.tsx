import { AUDIT_PHASES } from "./auditPhases";
import classes from "./AuditScan.module.css";

interface Props {
  phase: number;
  check: string;
  clock: string;
}

export function AuditStatus({ phase, check, clock }: Props) {
  const Icon = AUDIT_PHASES[phase].icon;

  return (
    <div className={classes.status}>
      <div className={classes.statusTop}>
        <span className={classes.stepCount}>
          Step {phase + 1} of {AUDIT_PHASES.length}
        </span>
        <span className={classes.clock}>{clock}</span>
      </div>

      <div key={phase} className={classes.stepRow}>
        <span className={classes.stepIcon}>
          <Icon size={16} />
        </span>
        <div className={classes.stepText}>
          <div className={classes.stepTitle}>{AUDIT_PHASES[phase].title}</div>
          <div key={check} className={classes.check}>
            <span className={classes.checkDot} />
            {check}
          </div>
        </div>
      </div>

      <div className={classes.segments} role="progressbar" aria-valuemin={0} aria-valuemax={AUDIT_PHASES.length} aria-valuenow={phase}>
        {AUDIT_PHASES.map((p, i) => (
          <span
            key={p.title}
            className={classes.segment}
            data-i={i}
            data-state={i < phase ? "done" : i === phase ? "active" : "pending"}
          />
        ))}
      </div>
    </div>
  );
}
