import { ColorSwatch, UnstyledButton } from "@mantine/core";
import type { SeoCompetitorComparison } from "@/shared/types";
import classes from "./Trend.module.css";

export function TrendLegend({
  series,
  palette,
  you,
  selectedId,
  onSelect,
}: {
  series: SeoCompetitorComparison[];
  palette: string[];
  you: string | null;
  selectedId: string | null;
  onSelect: (competitorId: string) => void;
}) {
  return (
    <div className={classes.legend}>
      {you && (
        <span className={classes.legendItem} data-you>
          <ColorSwatch color={you} size={10} radius={3} withShadow={false} />
          Your page
        </span>
      )}
      {series.map((c, i) => (
        <UnstyledButton
          key={c.competitorId}
          className={classes.legendItem}
          data-active={c.competitorId === selectedId || undefined}
          onClick={() => onSelect(c.competitorId)}
        >
          <ColorSwatch color={palette[i]} size={10} radius={3} withShadow={false} />
          <span className={classes.legendText}>{c.label}</span>
        </UnstyledButton>
      ))}
    </div>
  );
}
