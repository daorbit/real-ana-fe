import { useEffect, useState, type ReactNode } from "react";
import {
  Alert, Group, Loader, Pagination, ScrollArea, Select, Skeleton, Table, Text, TextInput, UnstyledButton,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { AlertTriangle, ArrowDown, ArrowUp, Search } from "lucide-react";
import { useGetSearchBreakdownQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type {
  SearchBreakdownDimension, SearchBreakdownRow, SearchBreakdownSort, SearchType,
} from "@/shared/types";
import { METRICS, metricChange } from "../searchMetrics";
import classes from "./searchConsole.module.css";

const PAGE_SIZES = ["25", "50", "100", "200"];

export function SearchBreakdownTab({
  workspaceId,
  siteId,
  days,
  type,
  dimension,
  title,
  description,
  labelHeader,
  renderLabel,
  searchLabel,
  onOpenRow,
}: {
  workspaceId: string;
  siteId: string;
  days: number;
  type: SearchType;
  dimension: SearchBreakdownDimension;
  title: string;
  description: string;
  labelHeader: string;
  renderLabel: (row: SearchBreakdownRow) => ReactNode;
  searchLabel?: (row: SearchBreakdownRow) => string;
  onOpenRow?: (row: SearchBreakdownRow) => void;
}) {
  const [filter, setFilter] = useState("");
  const [q] = useDebouncedValue(filter.trim(), 300);
  const [sort, setSort] = useState<{ key: SearchBreakdownSort; desc: boolean }>({ key: "clicks", desc: true });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const hasSearchLabel = typeof searchLabel === "function";

  useEffect(() => setPage(1), [q, sort, days, type, dimension, pageSize]);

  const { data, isLoading, isFetching, error } = useGetSearchBreakdownQuery({
    workspaceId,
    siteId,
    dimension,
    days,
    type,
    page,
    pageSize,
    sort: sort.key,
    dir: sort.desc ? "desc" : "asc",
    q,
  });

  if (isLoading) return <Skeleton height={420} radius="md" />;
  if (error && !data) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Search Console data could not be loaded.")}
      </Alert>
    );
  }
  if (!data) return null;

  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const clicksMetric = METRICS[0];

  const header = (key: SearchBreakdownSort, label: string, numeric = true) => (
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
            {description} {data.totalAll ? `${data.totalAll.toLocaleString()} in this period.` : ""}
            {data.truncated && " Google returns up to 25,000 rows per report."}
          </Text>
        </div>
        <Group gap="xs" wrap="nowrap">
          {isFetching && <Loader size={14} />}
          <TextInput
            size="xs"
            placeholder={`Search ${labelHeader.toLowerCase()}s`}
            leftSection={<Search size={13} />}
            value={filter}
            onChange={(e) => setFilter(e.currentTarget.value)}
            aria-label={hasSearchLabel ? `Filter ${labelHeader.toLowerCase()}s` : `Search ${title.toLowerCase()}`}
          />
        </Group>
      </div>

      {data.rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          {data.totalAll ? "Nothing matches that search." : "No data for this period yet."}
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
              {data.rows.map((row, i) => {
                const change =
                  row.previousClicks === null
                    ? { text: "new", good: true, flat: false }
                    : metricChange(clicksMetric, row.clicks, row.previousClicks);
                return (
                  <Table.Tr
                    key={`${row.key}-${i}`}
                    className={onOpenRow ? classes.clickableRow : undefined}
                    onClick={onOpenRow ? () => onOpenRow(row) : undefined}
                  >
                    <Table.Td className={classes.labelCell} title={row.key}>
                      {renderLabel(row)}
                    </Table.Td>
                    <Table.Td className={classes.numCell}>{clicksMetric.format(row.clicks)}</Table.Td>
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

      {data.total > 0 && (
        <Group justify="space-between" mt="md" gap="sm">
          <Group gap="xs" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {((data.page - 1) * data.pageSize + 1).toLocaleString()}–
              {Math.min(data.page * data.pageSize, data.total).toLocaleString()} of {data.total.toLocaleString()}
            </Text>
            <Select
              size="xs"
              w={84}
              aria-label="Rows per page"
              data={PAGE_SIZES}
              value={String(pageSize)}
              onChange={(v) => v && setPageSize(Number(v))}
              allowDeselect={false}
            />
          </Group>
          {pages > 1 && <Pagination size="sm" total={pages} value={data.page} onChange={setPage} siblings={1} />}
        </Group>
      )}
    </div>
  );
}
