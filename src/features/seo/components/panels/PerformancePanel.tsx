import { Group, RingProgress, SimpleGrid, Stack, Text } from "@mantine/core";
import { Monitor, Smartphone } from "lucide-react";
import type { SeoPerformance, SeoScores, SeoStrategyResult } from "@/shared/types";
import { scoreColor, scoreLabel } from "@/features/seo/components/ScoreRing";
import { CruxPanel } from "@/features/seo/components/CruxPanel";
import { DiagnosticsPanel } from "@/features/seo/components/DiagnosticsPanel";
import { Panel } from "@/features/seo/components/shared/Panel";
import { MetricsTable, CategoryScores } from "@/features/seo/components/panels/TechnicalPanel";

/**
 * Everything about how fast the page is, split out from Technical.
 *
 * Technical answers "is this page set up correctly"; this answers "is it fast,
 * and for whom". They were one tab until the Chrome field data and composition
 * panels arrived and made it the longest in the report.
 *
 * Ordered by how much the numbers should be trusted: real Chrome visits first,
 * then our own visitors, then the Lighthouse lab run, then what the page is
 * made of. Field data beats lab data wherever the two disagree.
 */
export function PerformancePanel({
  performance,
  vitals,
}: {
  performance: SeoPerformance;
  /** Real-user Core Web Vitals from our own tracker. */
  vitals?: React.ReactNode;
}) {
  return (
    <Stack gap="lg">
      <CruxPanel crux={performance.crux} />
      {vitals}

      {performance.available && (
        <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
          {(["mobile", "desktop"] as const).map((strategy) => {
            const result: SeoStrategyResult | null = performance[strategy];
            if (!result) return null;
            const perf = result.scores.performance;
            return (
              <Panel
                key={strategy}
                title={strategy === "mobile" ? "Mobile" : "Desktop"}
                description="Core Web Vitals and category scores from this profile's Lighthouse run."
                icon={strategy === "mobile" ? Smartphone : Monitor}
                color={strategy === "mobile" ? "emerald" : "cyan"}
                right={
                  <Group gap={8} wrap="nowrap">
                    <RingProgress
                      size={40}
                      thickness={4}
                      roundCaps
                      sections={[{ value: perf ?? 0, color: scoreColor(perf) }]}
                      label={
                        <Text ta="center" size="xs" fw={700}>
                          {perf ?? "—"}
                        </Text>
                      }
                    />
                    <Text size="xs" c={scoreColor(perf)}>
                      {scoreLabel(perf)}
                    </Text>
                  </Group>
                }
              >
                <MetricsTable result={result} />
                <CategoryScores scores={result.scores as SeoScores} />
              </Panel>
            );
          })}
        </SimpleGrid>
      )}

      <DiagnosticsPanel diagnostics={performance.diagnostics} />
    </Stack>
  );
}
