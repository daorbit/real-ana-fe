import { scoreColor } from "@/features/seo/components/ScoreRing";
import classes from "../Share.module.css";

export function ScoreChip({ score }: { score: number }) {
  return (
    <span className={classes.score} data-tone={scoreColor(score)}>
      {score}
    </span>
  );
}
