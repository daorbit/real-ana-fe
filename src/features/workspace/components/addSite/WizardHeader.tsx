import { Fragment } from "react";
import { ActionIcon, Box } from "@mantine/core";
import { Check, X } from "lucide-react";
import type { WizardStep } from "./constants";
import classes from "./AddSiteWizard.module.css";

interface Props {
  title: string;
  steps: WizardStep[];
  current: number;
  onClose: () => void;
}

export function WizardHeader({ title, steps, current, onClose }: Props) {
  const progress = ((current + 1) / steps.length) * 100;

  return (
    <Box className={classes.header}>
      <Box className={classes.headerLeft}>
        <ActionIcon variant="subtle" color="gray" size="lg" onClick={onClose} aria-label="Close">
          <X size={18} />
        </ActionIcon>
        <span className={classes.headerTitle}>{title}</span>
      </Box>

      <ol className={classes.stepper} aria-label="Progress">
        {steps.map((s, i) => {
          const state = i === current ? "current" : i < current ? "done" : "todo";
          return (
            <Fragment key={s.label}>
              {i > 0 && <span className={classes.stepLine} aria-hidden />}
              <li className={classes.stepItem} data-state={state} aria-current={state === "current" ? "step" : undefined}>
                <span className={classes.stepNum}>{state === "done" ? <Check size={12} strokeWidth={3} /> : i + 1}</span>
                {s.label}
              </li>
            </Fragment>
          );
        })}
      </ol>

      <span className={classes.headerRight}>
        Step {current + 1} of {steps.length}
      </span>

      <Box className={classes.progress} aria-hidden __vars={{ "--wizard-progress": `${progress}%` }}>
        <div className={classes.progressFill} />
      </Box>
    </Box>
  );
}
