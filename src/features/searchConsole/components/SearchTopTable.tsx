import { ScrollArea, Table, UnstyledButton } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import type { SearchMetrics } from "@/shared/types";
import { METRIC_BY_KEY } from "../searchMetrics";
import { PositionChip, ShareBar } from "./SearchCells";
import { SearchSectionHead } from "./SearchSectionHead";
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
  showCtr = false,
}: {
  title: string;
  description: string;
  labelHeader: string;
  rows: TopRow[];
  emptyText: string;
  onViewAll?: () => void;
  onOpenRow?: (row: TopRow) => void;
  showCtr?: boolean;
}) {
  const maxClicks = Math.max(0, ...rows.map((r) => r.clicks));
  const showViews = rows.some((r) => r.views !== undefined);

  return (
    <section className={classes.group}>
      <SearchSectionHead
        title={title}
        description={description}
        right={
          onViewAll && (
            <UnstyledButton className={classes.textLink} onClick={onViewAll}>
              View all
            </UnstyledButton>
          )
        }
      />

      <div className={classes.listCard}>
        {rows.length === 0 ? (
          <p className={classes.emptyRow}>{emptyText}</p>
        ) : (
          <ScrollArea className={classes.tableScroll}>
            <Table fz="xs" className={classes.table} highlightOnHover={Boolean(onOpenRow)}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{labelHeader}</Table.Th>
                  <Table.Th className={classes.numCell}>Clicks</Table.Th>
                  {showViews && <Table.Th className={classes.numCell}>Views</Table.Th>}
                  <Table.Th className={classes.numCell}>Impressions</Table.Th>
                  {showCtr && <Table.Th className={classes.numCell}>CTR</Table.Th>}
                  <Table.Th className={classes.numCell}>Position</Table.Th>
                  {onOpenRow && <Table.Th className={classes.chevronCell} />}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row, i) => (
                  <Table.Tr
                    key={`${row.key}-${i}`}
                    className={onOpenRow ? classes.clickableRow : undefined}
                    onClick={onOpenRow ? () => onOpenRow(row) : undefined}
                  >
                    <Table.Td className={classes.topLabelCell} title={row.key}>
                      {row.label}
                    </Table.Td>
                    <Table.Td className={classes.numCell}>
                      <ShareBar
                        compact
                        value={row.clicks}
                        max={maxClicks}
                        label={METRIC_BY_KEY.clicks.format(row.clicks)}
                      />
                    </Table.Td>
                    {showViews && (
                      <Table.Td className={classes.numCell}>{METRIC_BY_KEY.clicks.format(row.views ?? 0)}</Table.Td>
                    )}
                    <Table.Td className={`${classes.numCell} ${classes.mutedCell}`}>
                      {METRIC_BY_KEY.impressions.format(row.impressions)}
                    </Table.Td>
                    {showCtr && (
                      <Table.Td className={`${classes.numCell} ${classes.mutedCell}`}>
                        {METRIC_BY_KEY.ctr.format(row.ctr)}
                      </Table.Td>
                    )}
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
    </section>
  );
}
