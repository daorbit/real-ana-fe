import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Alert, Group, Pagination, ScrollArea, Skeleton, Table, Text, TextInput, UnstyledButton,
} from "@mantine/core";
import { AlertTriangle, ArrowDown, ArrowUp, Search } from "lucide-react";
import { useGetSearchBreakdownQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type { SearchBreakdownDimension, SearchBreakdownRow } from "@/shared/types";
import { METRICS, metricChange } from "../searchMetrics";
import classes from "./searchConsole.module.css";

type SortKey = "key" | "clicks" | "change" | "impressions" | "ctr" | "position";

const PAGE_SIZE = 50;

function clicksChange(row: SearchBreakdownRow): number {
  if (row.previousClicks === null) return Number.POSITIVE_INFINITY;
  if (!row.previousClicks) return row.clicks ? Number.POSITIVE_INFINITY : 0;
  return (row.clicks - row.previousClicks) / row.previousClicks;
}

export function SearchBreakdownTab({
  workspaceId,
  siteId,
  days,
  dimension,
  title,
  description,
  labelHeader,
  renderLabel,
  searchLabel,
}: {
  workspaceId: string;
  siteId: string;
  days: number;
  dimension: SearchBreakdownDimension;
  title: string;
  description: string;
  labelHeader: string;
  renderLabel: (row: SearchBreakdownRow) => ReactNode;
  searchLabel: (row: SearchBreakdownRow) => string;
}) {
  const { data, isLoading, error } = useGetSearchBreakdownQuery({ workspaceId, siteId, dimension, days });
  const [filter, setFilter] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({ key: "clicks", desc: true });
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [filter, sort, days, dimension]);

  const rows = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const list = (data?.rows ?? []).filter((r) => !q || searchLabel(r).toLowerCase().includes(q));
    const value = (r: SearchBreakdownRow): number | string =>
      sort.key === "key" ? searchLabel(r).toLowerCase() : sort.key === "change" ? clicksChange(r) : r[sort.key];
    return [...list].sort((a, b) => {
      const av = value(a);
      const bv = value(b);
      const cmp = typeof av === "string" ? av.localeCompare(String(bv)) : av - (bv as number);
      return sort.desc ? -cmp : cmp;
    });
  }, [data, filter, sort, searchLabel]);

  if (isLoading) return <Skeleton height={420} radius="md" />;
  if (error || !data) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Search Console data could not be loaded.")}
      </Alert>
    );
  }

  const pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const shown = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const clicksMetric = METRICS[0];

  const header = (key: SortKey, label: string, numeric = true) => (
    <Table.Th className={numeric ? classes.numCell : undefined}>
      <UnstyledButton
        className={classes.sortButton}
        data-active={sort.key === key || undefined}
        onClick={() => setSort((s) => ({ key, desc: s.key === key ? !s.desc : key !== "key" && key !== "position" }))}
      >
        {label}
        {sort.key === key && (sort.desc ? <ArrowDown size={11} /> : <ArrowUp size={11} />)}
      </UnstyledButton>
    </Table.Th>
  );

  return (
    <div className={classes.card}>
      <div className={classes.cardHead}>
        <div>
          <Text fw={650} size="sm">
            {title}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {description} {data.rows.length ? `${data.rows.length.toLocaleString()} in this period.` : ""}
          </Text>
        </div>
        {data.rows.length > 10 && (
          <TextInput
            size="xs"
            placeholder={`Filter ${labelHeader.toLowerCase()}s`}
            leftSection={<Search size={13} />}
            value={filter}
            onChange={(e) => setFilter(e.currentTarget.value)}
            aria-label={`Filter ${title.toLowerCase()}`}
          />
        )}
      </div>

      {shown.length === 0 ? (
        <Text size="sm" c="dimmed">
          {data.rows.length ? "Nothing matches that filter." : "No data for this period yet."}
        </Text>
      ) : (
        <ScrollArea className={classes.tableScroll}>
          <Table verticalSpacing={8} fz="xs" className={classes.table} highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                {header("key", labelHeader, false)}
                {header("clicks", "Clicks")}
                {header("change", "Change")}
                {header("impressions", "Impressions")}
                {header("ctr", "CTR")}
                {header("position", "Pos.")}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {shown.map((row, i) => {
                const change =
                  row.previousClicks === null
                    ? { text: "new", good: true, flat: false }
                    : metricChange(clicksMetric, row.clicks, row.previousClicks);
                return (
                  <Table.Tr key={`${row.key}-${i}`}>
                    <Table.Td className={classes.labelCell} title={searchLabel(row)}>
                      {renderLabel(row)}
                    </Table.Td>
                    {METRICS.slice(0, 1).map((m) => (
                      <Table.Td key={m.key} className={classes.numCell}>
                        {m.format(row[m.key])}
                      </Table.Td>
                    ))}
                    <Table.Td className={classes.numCell}>
                      {change ? (
                        <span className={classes.change} data-good={change.good || undefined} data-flat={change.flat || undefined}>
                          {change.text}
                        </span>
                      ) : (
                        "—"
                      )}
                    </Table.Td>
                    {METRICS.slice(1).map((m) => (
                      <Table.Td key={m.key} className={classes.numCell}>
                        {m.format(row[m.key])}
                      </Table.Td>
                    ))}
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}

      {pages > 1 && (
        <Group justify="space-between" mt="md" gap="sm">
          <Text size="xs" c="dimmed">
            {((page - 1) * PAGE_SIZE + 1).toLocaleString()}–{Math.min(page * PAGE_SIZE, rows.length).toLocaleString()} of{" "}
            {rows.length.toLocaleString()}
          </Text>
          <Pagination size="sm" total={pages} value={page} onChange={setPage} />
        </Group>
      )}
    </div>
  );
}
