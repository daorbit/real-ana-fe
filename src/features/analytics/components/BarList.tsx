import { useState, type ReactNode } from "react";
import { ActionIcon, Tooltip } from "@mantine/core";
import { GitCompareArrows, Inbox, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { num, share } from "@/shared/lib";
import { RankCard, RankEmpty } from "@/shared/ui/rank/RankCard";
import { RankList } from "@/shared/ui/rank/RankList";
import { DonutBreakdown } from "@/shared/ui/rank/DonutBreakdown";
import { PathLabel, isPathKey } from "@/shared/ui/rank/PathLabel";
import { toRankTone } from "@/shared/ui/rank/tones";
import { BreakdownDelta, NO_COMPARE, type BreakdownCompareHook } from "./BreakdownDelta";
import type { Bucket, StatsFilter } from "@/shared/types";

export function BarList({
  title,
  items,
  color = "teal",
  icon,
  format,
  empty,
  filterKey,
  onFilter,
  fill = true,
  dimension,
  useCompare,
  chart = "list",
}: {
  chart?: "list" | "donut";
  title: string;
  items: Bucket[];
  color?: string;
  icon?: LucideIcon;
  format?: (key: string) => ReactNode;
  empty?: string;
  filterKey?: keyof StatsFilter;
  onFilter?: (key: keyof StatsFilter, value: string) => void;
  fill?: boolean;
  dimension?: string;
  useCompare?: BreakdownCompareHook;
}) {
  const { t } = useTranslation();
  const [compareOn, setCompareOn] = useState(false);
  const canCompare = Boolean(dimension && useCompare);

  const compareHook = useCompare ?? NO_COMPARE;
  const { rows: compareRows, loading: compareLoading } = compareHook(dimension ?? "", compareOn && canCompare);

  const showCompare = compareOn && canCompare && !!compareRows;
  const shown: Bucket[] = showCompare ? compareRows.map((r) => ({ key: r.key, count: r.count })) : items;
  const deltaByKey = new Map(compareRows?.map((r) => [r.key, r]) ?? []);
  const total = shown.reduce((sum, i) => sum + i.count, 0);

  return (
    <RankCard
      title={title}
      icon={icon}
      tone={toRankTone(color)}
      fill={fill}
      subtitle={shown.length > 0 ? `${num(total)} total · ${shown.length} ${shown.length === 1 ? "item" : "items"}` : undefined}
      actions={
        canCompare && (
          <Tooltip label="Compare to the baseline period" withArrow>
            <ActionIcon
              variant={compareOn ? "filled" : "subtle"}
              color={compareOn ? "emerald" : "gray"}
              size="md"
              radius="md"
              loading={compareLoading}
              onClick={() => setCompareOn((v) => !v)}
              aria-label="Compare to the baseline period"
              aria-pressed={compareOn}
            >
              <GitCompareArrows size={15} />
            </ActionIcon>
          </Tooltip>
        )
      }
    >
      {shown.length === 0 ? (
        <RankEmpty icon={Inbox}>{empty ?? t("analytics.waitingForData")}</RankEmpty>
      ) : chart === "donut" && !showCompare ? (
        <DonutBreakdown
          items={shown.map((i) => ({
            id: i.key,
            label: format ? format(i.key) : i.key,
            title: filterKey && onFilter ? `Filter by ${i.key}` : i.key,
            value: i.count,
          }))}
          onSelect={filterKey && onFilter ? (key) => onFilter(filterKey, key) : undefined}
        />
      ) : (
        <RankList
          strip={!showCompare}
          items={shown.map((i) => ({
            id: i.key,
            label: format ? format(i.key) : isPathKey(i.key) ? <PathLabel path={i.key} /> : i.key,
            weight: i.count,
            title: filterKey && onFilter ? `Filter by ${i.key}` : i.key,
            value: num(i.count),
            aside: showCompare ? <BreakdownDelta row={deltaByKey.get(i.key)} /> : share(i.count, total),
          }))}
          onSelect={filterKey && onFilter ? (key) => onFilter(filterKey, key) : undefined}
        />
      )}
    </RankCard>
  );
}
