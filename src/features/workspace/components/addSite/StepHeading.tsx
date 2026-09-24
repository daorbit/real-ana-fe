import { Box } from "@mantine/core";
import type { WizardStep } from "./constants";
import classes from "./AddSiteWizard.module.css";

export function StepHeading({ step, index, total }: { step: WizardStep; index: number; total: number }) {
  return (
    <Box className={classes.heading}>
      <div className={classes.eyebrow}>
        Step {index + 1} of {total}
      </div>
      <h2 className={classes.title}>{step.title}</h2>
      <p className={classes.description}>{step.description}</p>
    </Box>
  );
}
