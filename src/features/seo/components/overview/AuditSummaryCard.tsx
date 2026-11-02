import { useState } from "react";
import { SegmentedControl, Text } from "@mantine/core";
import type { SeoPerformance, SeoScores } from "@/shared/types";
import { scoreLabel } from "@/features/seo/components/ScoreRing";
import { Gauge } from "@/features/seo/components/shared/Gauge";
import { SeoCard } from "@/features/seo/components/shared/SeoCard";
import { Pill } from "@/features/seo/components/shared/Pill";
import { ScoreBar } from "@/features/seo/components/shared/Bars";
import { scoreTone } from "@/features/seo/components/shared/tone";
import { bandHex } from "@/features/seo/components/utils";
import classes from "./overviewCards.module.css";

type Strategy = "desktop" | "mobile";

export function AuditSummaryCard({ score, performance }: { score: number; performance: SeoPerformance }) {
  const [strategy, setStrategy] = useState<Strategy>("desktop");
  const both = Boolean(performance.mobile && performance.desktop);
  const active = strategy === "desktop" ? performance.desktop : performance.mobile;
  const scores: SeoScores = both && active ? active.scores : performance.scores;

  return (
    <SeoCard
      className="col-8"
      title="Audit summary"
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
        ) : !performance.available ? (
          <Pill>Re-run for category scores</Pill>
        ) : undefined
      }
    >
      <div className={classes.summary}>
        <div className={classes.gaugeCol}>
          <Gauge value={score} size={140} thickness={11} color={bandHex(score)}>
            <Text className="g-num" fz={42}>{score}</Text>
            <Text className="g-of">of 100</Text>
          </Gauge>
          <Pill tone={scoreTone(score)}>{scoreLabel(score)}</Pill>
        </div>
        <div className={classes.bars}>
          <ScoreBar label="SEO" score={scores.seo} />
          <ScoreBar label="Performance" score={scores.performance} />
          <ScoreBar label="Accessibility" score={scores.accessibility} />
          <ScoreBar label="Best practices" score={scores.bestPractices} />
        </div>
      </div>
    </SeoCard>
  );
}
