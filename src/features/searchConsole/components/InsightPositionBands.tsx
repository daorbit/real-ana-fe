import type { CSSProperties } from "react";
import { Text } from "@mantine/core";
import { num } from "@/shared/lib";
import type { SearchPositionBand } from "@/shared/types";
import classes from "./insights.module.css";

const BAND_LABELS: Record<SearchPositionBand["band"], { label: string; range: string }> = {
  "1-3": { label: "Top 3", range: "Positions 1–3" },
  "4-10": { label: "Rest of page 1", range: "Positions 4–10" },
  "11-20": { label: "Page 2", range: "Positions 11–20" },
  "21+": { label: "Beyond page 2", range: "Position 21+" },
};

function MoveChip({ value }: { value: number }) {
  if (value === 0) return <span className={classes.bandMove}>No change</span>;
  return (
    <span className={classes.bandMove} data-dir={value > 0 ? "up" : "down"}>
      {value > 0 ? "+" : "−"}
      {num(Math.abs(value))} moved {value > 0 ? "in" : "out"}
    </span>
  );
}

export function InsightPositionBands({ bands }: { bands: SearchPositionBand[] }) {
  const total = bands.reduce((sum, b) => sum + b.queries, 0);
  if (!total) return null;

  return (
    <section className={classes.panel}>
      <header className={classes.panelHead}>
        <div>
          <Text fw={650} size="sm">
            Where your queries rank
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {num(total)} queries by average position. Moves compare the same queries with the previous period.
          </Text>
        </div>
      </header>

      <div className={classes.bandBar} role="img" aria-label="Share of queries in each position range">
        {bands.map((b) =>
          b.queries ? (
            <span
              key={b.band}
              className={classes.bandSegment}
              data-band={b.band}
              style={{ "--share": `${(b.queries / total) * 100}%` } as CSSProperties}
            />
          ) : null,
        )}
      </div>

      <div className={classes.bandGrid}>
        {bands.map((b) => (
          <div key={b.band} className={classes.band} data-band={b.band}>
            <span className={classes.bandLabel}>
              <span className={classes.bandDot} />
              {BAND_LABELS[b.band].label}
            </span>
            <span className={classes.bandValue}>{num(b.queries)}</span>
            <span className={classes.bandMeta}>
              {BAND_LABELS[b.band].range} · {num(b.clicks)} clicks
            </span>
            <MoveChip value={b.netMoved} />
          </div>
        ))}
      </div>
    </section>
  );
}
