import { Fragment } from "react";
import { Check } from "lucide-react";
import classes from "./TwoFactorSetup.module.css";

const STEPS = ["Scan", "Verify", "Backup codes"];

export function TwoFactorSetupSteps({ active }: { active: number }) {
  return (
    <div className={classes.steps}>
      {STEPS.map((label, i) => (
        <Fragment key={label}>
          {i > 0 && <span className={classes.stepLine} data-done={i <= active || undefined} />}
          <span
            className={classes.step}
            data-active={i === active || undefined}
            data-done={i < active || undefined}
          >
            <span className={classes.stepDot}>{i < active ? <Check size={12} /> : i + 1}</span>
            {label}
          </span>
        </Fragment>
      ))}
    </div>
  );
}
