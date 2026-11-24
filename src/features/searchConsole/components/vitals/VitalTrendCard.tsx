import { useState } from "react";
import { Text } from "@mantine/core";
import type { SearchWebVitals, SeoVitalKey } from "@/shared/types";
import { VITALS, formatVital } from "@/features/seo/components/panels/performance/vitalMeta";
import { SearchCardHead } from "../SearchSectionHead";
import { SearchSegmented } from "../SearchSegmented";
import { VitalTrendChart } from "./VitalTrendChart";
import classes from "../searchConsole.module.css";

const ITEMS = VITALS.map((v) => ({ value: v.key as SeoVitalKey, label: v.label, title: v.name }));

export function VitalTrendCard({ data }: { data: SearchWebVitals }) {
  const [key, setKey] = useState<SeoVitalKey>("lcp");
  const meta = VITALS.find((v) => v.key === key) ?? VITALS[0];
  const trend = data.metrics[key]?.trend ?? [];
  const points = data.periods.map((date, i) => ({ date, value: trend[i] ?? null }));
  const measured = points.filter((p) => p.value !== null).length;

  return (
    <section className={classes.card}>
      <SearchCardHead
        title="Trend"
        description={`${meta.name}, week by week. Green marks good (${formatVital(meta.good, meta.unit)}) and red marks poor (${formatVital(meta.poor, meta.unit)}).`}
        right={<SearchSegmented items={ITEMS} value={key} onChange={setKey} label="Vital" size="xs" />}
      />
      {measured > 1 ? (
        <VitalTrendChart points={points} meta={meta} />
      ) : (
        <Text size="sm" c="dimmed">
          Google doesn&apos;t have enough history for this vital yet.
        </Text>
      )}
    </section>
  );
}
