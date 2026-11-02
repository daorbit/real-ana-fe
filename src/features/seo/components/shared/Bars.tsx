import { Progress } from "@mantine/core";
import { bandHex } from "@/features/seo/components/utils";
import classes from "./seoUi.module.css";

export function ScoreBar({ label, score }: { label: string; score: number | null }) {
  return (
    <div className={classes.bar}>
      <div className={classes.barTop}>
        <span>{label}</span>
        <span className={classes.barValue}>{score ?? "—"}</span>
      </div>
      <Progress
        value={score ?? 0}
        color={bandHex(score)}
        size={6}
        radius="xl"
        classNames={{ root: classes.track }}
        aria-label={`${label} ${score ?? "not measured"}`}
      />
    </div>
  );
}

export function SplitBar({
  good,
  mid,
  poor,
  label,
}: {
  good: number;
  mid: number;
  poor: number;
  label: string;
}) {
  return (
    <Progress.Root size={8} radius="xl" classNames={{ root: classes.track }} aria-label={label}>
      <Progress.Section value={good} color="var(--green)" />
      <Progress.Section value={mid} color="var(--amber)" />
      <Progress.Section value={poor} color="var(--red)" />
    </Progress.Root>
  );
}
