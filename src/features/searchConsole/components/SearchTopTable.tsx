import { Button, ScrollArea, Table, Text } from "@mantine/core";
import { ArrowRight, ChevronRight } from "lucide-react";
import type { SearchMetrics } from "@/shared/types";
import { METRIC_BY_KEY } from "../searchMetrics";
import { PositionChip, ShareBar } from "./SearchCells";
import classes from "./searchConsole.module.css";

export type TopRow = SearchMetrics & { key: string; label: string; views?: number };

export function SearchTopTable({
  title,
  description,
  labelHeader,
  rows,
  emptyText,
  onViewAll,
  onOpenRow,
}: {
  title: string;
  description: string;
  labelHeader: string;
  rows: TopRow[];
  emptyText: string;
  onViewAll?: () => void;
  onOpenRow?: (row: TopRow) => void;
}) {
  const maxClicks = Math.max(0, ...rows.map((r) => r.clicks));
  const showViews = rows.some((r) => r.views !== undefined);

  return (
    <div className={classes.card}>
      <div className={classes.cardHead}>
        <div>
          <Text fw={650} size="sm">
            {title}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {description}
          </Text>
        </div>
        {onViewAll && (
          <Button variant="subtle" size="compact-sm" rightSection={<ArrowRight size={13} />} onClick={onViewAll}>
            View all
          </Button>
        )}
      </div>

      {rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          {emptyText}
        </Text>
      ) : (
        <ScrollArea className={classes.tableScroll}>
          <Table verticalSpacing={9} fz="xs" className={classes.table} highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th className={classes.rankCell}>#</Table.Th>
                <Table.Th>{labelHeader}</Table.Th>
                <Table.Th className={classes.numCell}>Clicks</Table.Th>
                {showViews && <Table.Th className={classes.numCell}>Views</Table.Th>}
                <Table.Th className={classes.numCell}>Impr.</Table.Th>
                <Table.Th className={classes.numCell}>Position</Table.Th>
                {onOpenRow && <Table.Th />}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row, i) => (
                <Table.Tr
                  key={`${row.key}-${i}`}
                  className={onOpenRow ? classes.clickableRow : undefined}
                  onClick={onOpenRow ? () => onOpenRow(row) : undefined}
                >
                  <Table.Td className={classes.rankCell}>{i + 1}</Table.Td>
                  <Table.Td className={classes.labelCell} title={row.key}>
                    {row.label}
                  </Table.Td>
                  <Table.Td className={classes.numCell}>
                    <ShareBar value={row.clicks} max={maxClicks} label={METRIC_BY_KEY.clicks.format(row.clicks)} />
                  </Table.Td>
                  {showViews && (
                    <Table.Td className={classes.numCell}>{METRIC_BY_KEY.clicks.format(row.views ?? 0)}</Table.Td>
                  )}
                  <Table.Td className={classes.numCell}>{METRIC_BY_KEY.impressions.format(row.impressions)}</Table.Td>
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
    </div>
  );
}
