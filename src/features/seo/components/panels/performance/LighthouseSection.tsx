import { useState } from "react";
import { SegmentedControl, Text } from "@mantine/core";
import type { SeoPerformance, SeoScores } from "@/shared/types";
import { Gauge } from "@/features/seo/components/shared/Gauge";
import { SeoSection } from "@/features/seo/components/shared/SeoCard";
import { Pill } from "@/features/seo/components/shared/Pill";
import { ListRow, ListTitle, SeoList } from "@/features/seo/components/shared/SeoList";
import { Tiles } from "@/features/seo/components/shared/Tile";
import type { Tone } from "@/features/seo/components/shared/tone";
import { METRIC_ROWS, bandHex } from "@/features/seo/components/utils";
import classes from "./performance.module.css";

type Strategy = "desktop" | "mobile";

const CATEGORIES: { key: keyof SeoScores; label: string }[] = [
  { key: "seo", label: "SEO" },
  { key: "performance", label: "Performance" },
  { key: "accessibility", label: "Accessibility" },
  { key: "bestPractices", label: "Best practices" },
];

function metricTone(value: number, good: number): Tone {
  return value <= good ? "good" : value <= good * 2 ? "warn" : "bad";
}

function metricText(value: number, unit: "ms" | "s" | ""): string {
  if (unit === "s") return `${(value / 1000).toFixed(1)} s`;
  if (unit === "ms") return `${Math.round(value)} ms`;
  return String(value);
}

export function LighthouseSection({ performance }: { performance: SeoPerformance }) {
  const [strategy, setStrategy] = useState<Strategy>(performance.desktop ? "desktop" : "mobile");
  const both = Boolean(performance.desktop && performance.mobile);
  const result = performance[strategy] ?? performance.desktop ?? performance.mobile;
  const scores = result?.scores ?? performance.scores;

  return (
    <SeoSection
      title="Lighthouse"
      description={`Lab scores from the last audit${result ? `, ${result.strategy}` : ""}.`}
      right={
        both ? (
          <SegmentedControl
            size="xs"
            value={strategy}
            onChange={(v) => setStrategy(v as Strategy)}
            data={[
              { value: "desktop", label: "Desktop" },
              { value: "mobile", label: "Mobile" },
            ]}
          />
        ) : undefined
      }
    >
      <Tiles wide>
        {CATEGORIES.map((c) => {
          const value = scores[c.key];
          return (
            <div key={c.key} className={classes.ringTile}>
              <Gauge value={value ?? 0} size={84} thickness={7} color={bandHex(value)}>
                <Text className="g-num" fz={24}>{value ?? "—"}</Text>
              </Gauge>
              <span className={classes.ringLabel}>{c.label}</span>
            </div>
          );
        })}
      </Tiles>

      {result && (
        <SeoList>
          <ListTitle>Lab metrics</ListTitle>
          {METRIC_ROWS.map((row) => {
            const v = result.metrics[row.key];
            if (v === null) return null;
            return (
              <ListRow
                key={row.key}
                title={row.label}
                aside={<Pill tone={metricTone(v, row.good)}>{metricText(v, row.unit)}</Pill>}
              />
            );
          })}
        </SeoList>
      )}
    </SeoSection>
  );
}
