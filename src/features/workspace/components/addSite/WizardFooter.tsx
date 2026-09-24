import { Box, Button } from "@mantine/core";
import { ArrowLeft, ArrowRight } from "lucide-react";
import classes from "./AddSiteWizard.module.css";

interface Props {
  canGoBack: boolean;
  isLast: boolean;
  primaryLabel: string;
  busy: boolean;
  onBack: () => void;
  onNext: () => void;
  onDone: () => void;
}

export function WizardFooter({ canGoBack, isLast, primaryLabel, busy, onBack, onNext, onDone }: Props) {
  return (
    <Box className={classes.footer}>
      {canGoBack ? (
        <Button variant="default" leftSection={<ArrowLeft size={15} />} onClick={onBack} disabled={busy}>
          Back
        </Button>
      ) : (
        <span />
      )}

      {isLast ? (
        <Button onClick={onDone}>Done</Button>
      ) : (
        <Button onClick={onNext} loading={busy} rightSection={<ArrowRight size={15} />}>
          {primaryLabel}
        </Button>
      )}
    </Box>
  );
}
