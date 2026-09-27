import { useState } from "react";
import { Alert, Text } from "@mantine/core";
import { AlertTriangle, CheckCircle2, Target, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { useGetSearchInsightsQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { num } from "@/shared/lib";
import type { SearchType } from "@/shared/types";
import { INSIGHTS, INSIGHT_GROUPS, type InsightDef, type InsightGroup, type InsightItem } from "../insightDefs";
import { SearchInsightCard } from "./SearchInsightCard";
import { SearchInsightPanel } from "./SearchInsightPanel";
import { SelectableStat } from "./SelectableStat";
import { InsightsSkeleton } from "./SearchSkeletons";
import classes from "./insights.module.css";

const GROUP_CARD: Record<InsightGroup, { icon: LucideIcon; color: string }> = {
  opportunities: { icon: Target, color: "emerald" },
  growing: { icon: TrendingUp, color: "cyan" },
  attention: { icon: TrendingDown, color: "pink" },
};

export function SearchInsightsTab({
  workspaceId,
  siteId,
  days,
  type,
  onOpenQuery,
  onOpenPage,
}: {
  workspaceId: string;
  siteId: string;
  days: number;
  type: SearchType;
  onOpenQuery: (query: string) => void;
  onOpenPage: (url: string) => void;
}) {
  const { data, isLoading, error } = useGetSearchInsightsQuery({ workspaceId, siteId, days, type });
  const [group, setGroup] = useState<InsightGroup | null>(null);
  const [open, setOpen] = useState<InsightDef | null>(null);

  if (isLoading) return <InsightsSkeleton />;
  if (error && !data) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Insights could not be loaded.")}
      </Alert>
    );
  }
  if (!data) return null;

  const withRows = INSIGHTS.map((def) => ({ def, rows: def.rows(data) }));
  const groupCount = (id: InsightGroup) =>
    withRows.filter((x) => x.def.group === id).reduce((sum, x) => sum + x.rows.length, 0);

  const visible = withRows.filter((x) => (!group || x.def.group === group) && x.rows.length > 0);
  const clear = withRows.filter((x) => (!group || x.def.group === group) && x.rows.length === 0);

  const openRow = (def: InsightDef, row: InsightItem) =>
    def.dimension === "page" ? onOpenPage(row.key) : onOpenQuery(row.key);

  return (
    <div className={classes.root}>
      <Text size="sm" c="dimmed">
        Based on <b>{num(data.counts.queries)}</b> queries and <b>{num(data.counts.pages)}</b> pages with Google
        impressions in the last {days} days, compared with the {days} days before.
      </Text>

      <div className={classes.summary} role="group" aria-label="Filter insights">
        {INSIGHT_GROUPS.map((g) => (
          <SelectableStat
            key={g.id}
            active={group === g.id}
            onSelect={() => setGroup(group === g.id ? null : g.id)}
            icon={GROUP_CARD[g.id].icon}
            color={GROUP_CARD[g.id].color}
            label={g.label}
            value={groupCount(g.id)}
            hint={g.hint}
          />
        ))}
      </div>

      {visible.length > 0 ? (
        <div className={classes.grid}>
          {visible.map(({ def, rows }) => (
            <SearchInsightCard
              key={def.id}
              def={def}
              rows={rows}
              onOpenRow={(row) => openRow(def, row)}
              onViewAll={() => setOpen(def)}
            />
          ))}
        </div>
      ) : (
        <div className={classes.emptyState}>
          <CheckCircle2 size={22} />
          <Text fw={650} size="sm">
            Nothing to act on here
          </Text>
          <Text size="xs" c="dimmed">
            No items in this category for the selected period. Try a longer date range.
          </Text>
        </div>
      )}

      {clear.length > 0 && visible.length > 0 && (
        <div className={classes.clear}>
          <Text size="xs" fw={600} c="dimmed">
            All clear
          </Text>
          {clear.map(({ def }) => (
            <span key={def.id} className={classes.clearChip}>
              <CheckCircle2 size={12} />
              {def.title}
            </span>
          ))}
        </div>
      )}

      <SearchInsightPanel
        def={open}
        rows={open ? open.rows(data) : []}
        onClose={() => setOpen(null)}
        onOpen={(row) => {
          if (!open) return;
          const def = open;
          setOpen(null);
          openRow(def, row);
        }}
      />
    </div>
  );
}
