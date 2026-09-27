import { Button, Text, UnstyledButton } from "@mantine/core";
import { ArrowRight } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import classes from "./orbit.module.css";

export function SearchOrbitSummary({ days, onSummarize }: { days: number; onSummarize: () => void }) {
  return (
    <UnstyledButton className={classes.summary} onClick={onSummarize}>
      <span className={classes.mark}>
        <OrbitMark size={20} />
      </span>
      <span className={classes.summaryText}>
        <Text fw={650} size="sm">
          Orbit summary
        </Text>
        <Text size="xs" c="dimmed">
          A plain-language read of your last {days} days on Google, and what to do next.
        </Text>
      </span>
      <Button
        component="span"
        variant="light"
        color="emerald"
        rightSection={<ArrowRight size={14} />}
        className={classes.summaryButton}
      >
        Summarize
      </Button>
    </UnstyledButton>
  );
}
