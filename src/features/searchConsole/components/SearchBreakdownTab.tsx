import { useEffect, useState, type ReactNode } from "react";
import {
  Alert, Group, Loader, Pagination, ScrollArea, Select, Table, Text, TextInput, UnstyledButton,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { AlertTriangle, ArrowDown, ArrowUp, ChevronRight, Search } from "lucide-react";
import { useGetSearchBreakdownQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import type {
  SearchBreakdownDimension, SearchBreakdownRow, SearchBreakdownSort, SearchType,
} from "@/shared/types";
import { METRIC_BY_KEY } from "../searchMetrics";
import { ClickChange, PositionChip, ShareBar } from "./SearchCells";
import { BreakdownSkeleton } from "./SearchSkeletons";
import { SearchUpgradeNote } from "./SearchUpgradeNote";
import { useSearchEntitlements } from "../useSearchEntitlements";
import classes from "./searchConsole.module.css";

const PAGE_SIZES = ["25", "50", "100", "200"];

const plural = (word: string) => (word.endsWith("y") ? `${word.slice(0, -1)}ies` : `${word}s`);

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
  const [pageSize, setPageSize] = useState(25);
  const hasSearchLabel = typeof searchLabel === "function";
  const ent = useSearchEntitlements();

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

  if (isLoading) return <BreakdownSkeleton labelHeader={labelHeader} showViews={dimension === "page" && ent.pageViews} />;
  if (error && !data) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Search visibility data could not be loaded.")}
      </Alert>
    );
  }
  if (!data) return null;

  const pages = Math.max(1, Math.ceil(data.total / data.pageSize));
  const maxClicks = Math.max(0, ...data.rows.map((r) => r.clicks));
  const offset = (data.page - 1) * data.pageSize;
  const showViews = dimension === "page" && ent.pageViews;

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
            {data.totalAll > 0 && (
              <Text span size="xs" c="dimmed" fw={500} ml={8}>
                {data.totalAll.toLocaleString()} total
              </Text>
            )}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {description}
            {data.truncated && " Google returns up to 25,000 rows per report."}
          </Text>
        </div>
        <Group gap="xs" wrap="nowrap" className={classes.searchGroup}>
          {isFetching && <Loader size={14} />}
          <TextInput
            size="sm"
            className={classes.searchInput}
            placeholder={`Search ${plural(labelHeader.toLowerCase())}…`}
            leftSection={<Search size={14} />}
            value={filter}
            onChange={(e) => setFilter(e.currentTarget.value)}
            aria-label={hasSearchLabel ? `Filter ${plural(labelHeader.toLowerCase())}` : `Search ${title.toLowerCase()}`}
          />
        </Group>
      </div>

      {data.rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          {data.totalAll ? "Nothing matches that search." : "No data for this period yet."}
        </Text>
      ) : (
        <ScrollArea className={classes.tableScroll}>
          <Table verticalSpacing={9} fz="xs" className={classes.table} highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className={classes.rankCell}>#</Table.Th>
                {header("key", labelHeader, false)}
                {header("clicks", "Clicks")}
                {header("change", "Change")}
                {showViews && header("views", "Views")}
                {header("impressions", "Impressions")}
                {header("ctr", "CTR")}
                {header("position", "Position")}
                {onOpenRow && <Table.Th />}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.rows.map((row, i) => (
                <Table.Tr
                  key={`${row.key}-${i}`}
                  className={onOpenRow ? classes.clickableRow : undefined}
                  onClick={onOpenRow ? () => onOpenRow(row) : undefined}
                >
                  <Table.Td className={classes.rankCell}>{offset + i + 1}</Table.Td>
                  <Table.Td className={classes.labelCell} title={row.key}>
                    {renderLabel(row)}
                  </Table.Td>
                  <Table.Td className={classes.numCell}>
                    <ShareBar value={row.clicks} max={maxClicks} label={METRIC_BY_KEY.clicks.format(row.clicks)} />
                  </Table.Td>
                  <Table.Td className={classes.numCell}>
                    <ClickChange clicks={row.clicks} previousClicks={row.previousClicks} />
                  </Table.Td>
                  {showViews && (
                    <Table.Td className={classes.numCell}>{METRIC_BY_KEY.clicks.format(row.views ?? 0)}</Table.Td>
                  )}
                  <Table.Td className={classes.numCell}>{METRIC_BY_KEY.impressions.format(row.impressions)}</Table.Td>
                  <Table.Td className={classes.numCell}>{METRIC_BY_KEY.ctr.format(row.ctr)}</Table.Td>
                  <Table.Td className={classes.numCell}>
                    <PositionChip position={row.position} />
                  </Table.Td>
                  {onOpenRow && (
                    <Table.Td className={classes.chevronCell}>
                      <ChevronRight size={14} />
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}

      {data.limitedTo ? (
        <SearchUpgradeNote>
          Showing your top {data.limitedTo} {labelHeader.toLowerCase()}s by clicks, out of{" "}
          {data.totalAll.toLocaleString()}. Upgrade to see and search every {labelHeader.toLowerCase()}.
        </SearchUpgradeNote>
      ) : null}

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
          {pages > 1 && <Pagination size="sm" radius="xl" className={classes.pager} total={pages} value={data.page} onChange={setPage} siblings={1} />}
        </Group>
      )}
    </div>
  );
}
