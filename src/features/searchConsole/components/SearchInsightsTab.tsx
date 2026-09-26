import type { ReactNode } from "react";
import { Alert, ScrollArea, SimpleGrid, Skeleton, Table, Text } from "@mantine/core";
import {
  AlertTriangle, MousePointerClick, Sparkles, Target, TrendingDown, TrendingUp, Unlink, type LucideIcon,
} from "lucide-react";
import { useGetSearchInsightsQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { num } from "@/shared/lib";
import type { SearchInsightRow, SearchLostRow, SearchType } from "@/shared/types";
import { METRICS, metricChange } from "../searchMetrics";
import { renderPage, renderQuery } from "../searchConsoleTabs";
import type { DrillTarget } from "./SearchDrilldownDrawer";
import classes from "./searchConsole.module.css";

type Column<T> = { label: string; render: (row: T) => ReactNode };

const [CLICKS, IMPRESSIONS, CTR, POSITION] = METRICS;

function clickChange(row: SearchInsightRow): ReactNode {
  const change =
    row.previousClicks === null
      ? { text: "new", good: true, flat: false }
      : metricChange(CLICKS, row.clicks, row.previousClicks);
  if (!change) return "—";
  const delta = row.previousClicks === null ? row.clicks : row.clicks - row.previousClicks;
  return (
    <span className={classes.change} data-good={change.good || undefined} data-flat={change.flat || undefined}>
      {delta > 0 ? "+" : ""}
      {num(delta)} ({change.text})
    </span>
  );
}

function InsightCard<T extends { key: string }>({
  icon: Icon,
  tone,
  title,
  description,
  labelHeader,
  renderLabel,
  columns,
  rows,
  emptyText,
  onOpen,
}: {
  icon: LucideIcon;
  tone?: "warn" | "bad";
  title: string;
  description: string;
  labelHeader: string;
  renderLabel: (row: T) => ReactNode;
  columns: Column<T>[];
  rows: T[];
  emptyText: string;
  onOpen?: (row: T) => void;
}) {
  return (
    <div className={classes.card}>
      <div className={classes.insightTitle}>
        <span className={classes.insightBadge} data-tone={tone}>
          <Icon size={15} />
        </span>
        <div>
          <Text fw={650} size="sm">
            {title}
          </Text>
          <Text size="xs" c="dimmed" mt={2} mb="md">
            {description}
          </Text>
        </div>
      </div>

      {rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          {emptyText}
        </Text>
      ) : (
        <ScrollArea.Autosize mah={340} className={classes.tableScroll}>
          <Table verticalSpacing={7} fz="xs" className={classes.table} highlightOnHover stickyHeader>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{labelHeader}</Table.Th>
                {columns.map((c) => (
                  <Table.Th key={c.label} className={classes.numCell}>
                    {c.label}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row, i) => (
                <Table.Tr
                  key={`${row.key}-${i}`}
                  className={onOpen ? classes.clickableRow : undefined}
                  onClick={onOpen ? () => onOpen(row) : undefined}
                >
                  <Table.Td className={classes.labelCell} title={row.key}>
                    {renderLabel(row)}
                  </Table.Td>
                  {columns.map((c) => (
                    <Table.Td key={c.label} className={classes.numCell}>
                      {c.render(row)}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea.Autosize>
      )}
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: number }) {
  return (
    <div className={classes.tile} role="presentation">
      <span className={classes.tileLabel}>{label}</span>
      <span className={classes.tileValue}>{num(value)}</span>
    </div>
  );
}

export function SearchInsightsTab({
  workspaceId,
  siteId,
  days,
  type,
  onOpen,
}: {
  workspaceId: string;
  siteId: string;
  days: number;
  type: SearchType;
  onOpen: (target: DrillTarget) => void;
}) {
  const { data, isLoading, error } = useGetSearchInsightsQuery({ workspaceId, siteId, days, type });

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={280} radius="md" />
        ))}
      </SimpleGrid>
    );
  }
  if (error && !data) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Insights could not be loaded.")}
      </Alert>
    );
  }
  if (!data) return null;

  const openQuery = (row: { key: string }) => onOpen({ dimension: "query", value: row.key });
  const openPage = (row: { key: string }) => onOpen({ dimension: "page", value: row.key });

  const clicksCol: Column<SearchInsightRow> = { label: "Clicks", render: (r) => CLICKS.format(r.clicks) };
  const imprCol: Column<SearchInsightRow> = { label: "Impr.", render: (r) => IMPRESSIONS.format(r.impressions) };
  const posCol: Column<SearchInsightRow> = { label: "Pos.", render: (r) => POSITION.format(r.position) };
  const ctrCol: Column<SearchInsightRow> = { label: "CTR", render: (r) => CTR.format(r.ctr) };
  const changeCol: Column<SearchInsightRow> = { label: "Change", render: clickChange };

  return (
    <div className={classes.section}>
      <div className={classes.insightSummary}>
        <SummaryTile label="Queries" value={data.counts.queries} />
        <SummaryTile label="Pages" value={data.counts.pages} />
        <SummaryTile label="New queries" value={data.counts.newQueries} />
        <SummaryTile label="Lost queries" value={data.counts.lostQueries} />
      </div>

      <div className={classes.insightGrid}>
        <InsightCard
          icon={Target}
          title="Quick wins"
          description="Ranking in positions 4–20 with plenty of impressions. A small improvement could lift them into the top 3 or onto page 1."
          labelHeader="Query"
          renderLabel={renderQuery}
          columns={[imprCol, posCol, clicksCol]}
          rows={data.quickWins}
          emptyText="No near-miss queries right now."
          onOpen={openQuery}
        />
        <InsightCard
          icon={MousePointerClick}
          tone="warn"
          title="Low click-through"
          description="On page 1 but earning fewer clicks than that position usually gets. A sharper title and description can win them."
          labelHeader="Query"
          renderLabel={renderQuery}
          columns={[
            imprCol,
            ctrCol,
            { label: "Missed", render: (r) => `~${num(r.missedClicks ?? 0)}` },
          ]}
          rows={data.lowCtr}
          emptyText="Click-through looks healthy for your top-ranking queries."
          onOpen={openQuery}
        />
        <InsightCard
          icon={TrendingUp}
          title="Rising queries"
          description="Biggest gains in clicks against the previous period."
          labelHeader="Query"
          renderLabel={renderQuery}
          columns={[clicksCol, changeCol, posCol]}
          rows={data.risingQueries}
          emptyText="No queries gained clicks this period."
          onOpen={openQuery}
        />
        <InsightCard
          icon={TrendingDown}
          tone="bad"
          title="Falling queries"
          description="Biggest drops in clicks against the previous period."
          labelHeader="Query"
          renderLabel={renderQuery}
          columns={[clicksCol, changeCol, posCol]}
          rows={data.fallingQueries}
          emptyText="No queries lost clicks this period."
          onOpen={openQuery}
        />
        <InsightCard
          icon={TrendingUp}
          title="Rising pages"
          description="Pages gaining the most clicks from Google."
          labelHeader="Page"
          renderLabel={renderPage}
          columns={[clicksCol, changeCol, posCol]}
          rows={data.risingPages}
          emptyText="No pages gained clicks this period."
          onOpen={openPage}
        />
        <InsightCard
          icon={TrendingDown}
          tone="bad"
          title="Falling pages"
          description="Pages losing the most clicks from Google."
          labelHeader="Page"
          renderLabel={renderPage}
          columns={[clicksCol, changeCol, posCol]}
          rows={data.fallingPages}
          emptyText="No pages lost clicks this period."
          onOpen={openPage}
        />
        <InsightCard
          icon={Sparkles}
          title="New queries"
          description="Getting clicks now, with no clicks in the previous period."
          labelHeader="Query"
          renderLabel={renderQuery}
          columns={[clicksCol, imprCol, posCol]}
          rows={data.newQueries}
          emptyText="No new queries this period."
          onOpen={openQuery}
        />
        <InsightCard<SearchLostRow>
          icon={Unlink}
          tone="bad"
          title="Lost queries"
          description="Brought clicks in the previous period and none now."
          labelHeader="Query"
          renderLabel={renderQuery}
          columns={[
            { label: "Clicks before", render: (r) => num(r.previousClicks) },
            { label: "Impr. before", render: (r) => num(r.previousImpressions) },
          ]}
          rows={data.lostQueries}
          emptyText="No queries dropped away this period."
          onOpen={openQuery}
        />
      </div>
    </div>
  );
}
