import { Loader, Tooltip, UnstyledButton } from "@mantine/core";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import classes from "@/shared/ui/stat/StatCard.module.css";

export function StatExplainButton({
  open,
  explaining,
  onToggle,
}: {
  open: boolean;
  explaining?: boolean;
  onToggle: () => void;
}) {
  return (
    <Tooltip label="Why did this change? Ask Orbit" withArrow disabled={open}>
      <UnstyledButton
        className={classes.info}
        aria-label={open ? "Hide Orbit's explanation" : "Why did this change? Ask Orbit"}
        aria-pressed={open}
        onClick={onToggle}
      >
        {explaining ? <Loader size={10} color="gray" /> : <OrbitMark size={14} />}
      </UnstyledButton>
    </Tooltip>
  );
}

export function StatExplanation({
  explaining,
  explanation,
  explainError,
}: {
  explaining?: boolean;
  explanation?: string | null;
  explainError?: string | null;
}) {
  return (
    <p className={classes.explanation} data-error={explainError ? true : undefined}>
      {explaining ? "Looking at what changed…" : explainError ?? explanation ?? ""}
    </p>
  );
}
