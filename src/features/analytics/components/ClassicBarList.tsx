import { useState, type ReactNode } from "react";
import { ActionIcon, Card, Center, Group, Progress, Stack, Text, ThemeIcon, Tooltip } from "@mantine/core";
import { Filter, GitCompareArrows, Inbox, type LucideIcon } from "lucide-react";
import { useTranslation } from "react-i18next";
import { num, share } from "@/shared/lib";
import { BreakdownDelta, NO_COMPARE, type BreakdownCompareHook } from "./BreakdownDelta";
import type { Bucket, StatsFilter } from "@/shared/types";
import classes from "./ClassicBarList.module.css";

export function ClassicBarList({
  title,
  items,
  color = "teal",
  icon: Icon,
  format,
  empty,
  filterKey,
  onFilter,
  dimension,
  useCompare,
}: {
  title: string;
  items: Bucket[];
  color?: string;
  icon?: LucideIcon;
  format?: (key: string) => ReactNode;
  empty?: string;
  filterKey?: keyof StatsFilter;
  onFilter?: (key: keyof StatsFilter, value: string) => void;
  dimension?: string;
  useCompare?: BreakdownCompareHook;
}) {
  const { t } = useTranslation();
  const emptyText = empty ?? t("analytics.waitingForData");
  const clickable = Boolean(filterKey && onFilter);
  const [compareOn, setCompareOn] = useState(false);
  const canCompare = Boolean(dimension && useCompare);

  const { rows: compareRows, loading: compareLoading } = (useCompare ?? NO_COMPARE)(
    dimension ?? "",
    compareOn && canCompare,
  );

  const showCompare = compareOn && canCompare && !!compareRows;
  const shown: Bucket[] = showCompare ? compareRows.map((r) => ({ key: r.key, count: r.count })) : items;
  const deltaByKey = new Map(compareRows?.map((r) => [r.key, r]) ?? []);
  const total = shown.reduce((sum, i) => sum + i.count, 0);
  const max = Math.max(1, ...shown.map((i) => i.count));

  const pick = (key: string) => {
    if (filterKey && onFilter) onFilter(filterKey, key);
  };

  return (
    <Card withBorder radius="lg" padding="lg" h="100%">
      <Group gap={8} mb="md" justify="space-between" wrap="nowrap">
        <Group gap={8} wrap="nowrap" className={classes.titleGroup}>
          {Icon && <Icon size={15} className="sect-ic" />}
          <Text fw={600} c="dimmed" size="sm" truncate>{title}</Text>
        </Group>
        {canCompare && (
          <Tooltip label="Compare to the baseline period" withArrow>
            <ActionIcon
              variant={compareOn ? "filled" : "subtle"}
              color={compareOn ? "emerald" : "gray"}
              size="sm"
              loading={compareLoading}
              onClick={() => setCompareOn((v) => !v)}
              aria-label="Compare to the baseline period"
            >
              <GitCompareArrows size={14} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>

      {shown.length === 0 ? (
        <Center py="lg" mih={120}>
          <Stack align="center" gap={4}>
            <ThemeIcon variant="light" color="gray" size="md" radius="md"><Inbox size={16} /></ThemeIcon>
            <Text c="dimmed" size="xs">{emptyText}</Text>
          </Stack>
        </Center>
      ) : (
        <Stack gap="sm">
          {shown.map((i) => (
            <div
              key={i.key}
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              onClick={clickable ? () => pick(i.key) : undefined}
              onKeyDown={
                clickable
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        pick(i.key);
                      }
                    }
                  : undefined
              }
              className={clickable ? classes.row : undefined}
              title={clickable ? `Filter by ${i.key}` : undefined}
            >
              <Group justify="space-between" gap="xs" mb={4} wrap="nowrap">
                <Text size="sm" truncate className={classes.label}>
                  {format ? format(i.key) : i.key}
                </Text>
                <Group gap={6} wrap="nowrap">
                  {clickable && (
                    <span className={classes.filter}>
                      <Filter size={12} />
                      Filter
                    </span>
                  )}
                  {showCompare ? (
                    <BreakdownDelta row={deltaByKey.get(i.key)} />
                  ) : (
                    <Text size="xs" c="dimmed">{share(i.count, total)}</Text>
                  )}
                  <Text size="sm" fw={700}>{num(i.count)}</Text>
                </Group>
              </Group>
              <Progress value={(i.count / max) * 100} size="sm" radius="xl" color={color} />
            </div>
          ))}
        </Stack>
      )}
    </Card>
  );
}
