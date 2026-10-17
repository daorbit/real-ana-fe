import { num } from "@/shared/lib";
import { StatTile, StatTileGrid } from "@/shared/ui/StatTile";
import type { FunnelResultStep } from "@/shared/types";
import { funnelSummary } from "./funnelStats";
import classes from "./Funnel.module.css";

export function FunnelSummary({ steps }: { steps: FunnelResultStep[] }) {
  const { entered, completed, conversion, worst } = funnelSummary(steps);

  return (
    <div className={classes.summary}>
      <StatTileGrid>
        <StatTile label="Conversion" value={`${conversion}%`} note="First step to last" />
        <StatTile label="Entered" value={num(entered)} note="Sessions at step 1" />
        <StatTile label="Completed" value={num(completed)} note={`Reached step ${steps.length}`} />
        <StatTile
          label="Biggest drop"
          value={worst ? `−${worst.drop}%` : "None"}
          note={worst ? `At step ${worst.index + 1} · ${num(worst.lost)} left` : "Everyone continued"}
        />
      </StatTileGrid>
    </div>
  );
}
