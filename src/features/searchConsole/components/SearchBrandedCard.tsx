import { ScrollArea, Table } from "@mantine/core";
import { ChevronRight } from "lucide-react";
import dayjs from "dayjs";
import type { SearchBrandedSplit } from "@/shared/types";
import { METRIC_BY_KEY } from "../searchMetrics";
import { ClickDelta, PositionChip, ShareBar } from "./SearchCells";
import { SearchSectionHead } from "./SearchSectionHead";
import classes from "./searchConsole.module.css";

export type BrandValue = "BRANDED" | "NON_BRANDED";

export function SearchBrandedCard({
  split,
  onOpen,
}: {
  split: SearchBrandedSplit;
  onOpen?: (value: BrandValue) => void;
}) {
  const rows = [
    { value: "BRANDED" as const, label: "Branded", now: split.branded, before: split.previous?.branded },
    { value: "NON_BRANDED" as const, label: "Non-branded", now: split.nonBranded, before: split.previous?.nonBranded },
  ];
  const maxClicks = Math.max(...rows.map((r) => r.now.clicks));

  return (
    <section className={classes.group}>
      <SearchSectionHead
        title="Branded and non-branded searches"
        description={
          <>
            Searches Google recognises as being for your brand, and people finding you without it.
            {split.since && ` Google has this data from ${dayjs(split.since).format("MMM D, YYYY")}.`}
          </>
        }
      />
      <div className={classes.listCard}>
        <ScrollArea className={classes.tableScroll}>
          <Table fz="xs" className={classes.table} highlightOnHover={Boolean(onOpen)}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Searches</Table.Th>
                <Table.Th className={classes.numCell}>Clicks</Table.Th>
                {split.previous && <Table.Th className={classes.numCell}>Change</Table.Th>}
                <Table.Th className={classes.numCell}>Impressions</Table.Th>
                <Table.Th className={classes.numCell}>CTR</Table.Th>
                <Table.Th className={classes.numCell}>Position</Table.Th>
                {onOpen && <Table.Th className={classes.chevronCell} />}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((row) => (
                <Table.Tr
                  key={row.value}
                  className={onOpen ? classes.clickableRow : undefined}
                  onClick={onOpen ? () => onOpen(row.value) : undefined}
                >
                  <Table.Td className={classes.topLabelCell}>{row.label}</Table.Td>
                  <Table.Td className={classes.numCell}>
                    <ShareBar value={row.now.clicks} max={maxClicks} label={METRIC_BY_KEY.clicks.format(row.now.clicks)} />
                  </Table.Td>
                  {split.previous && (
                    <Table.Td className={classes.numCell}>
                      <ClickDelta clicks={row.now.clicks} previousClicks={row.before?.clicks ?? null} />
                    </Table.Td>
                  )}
                  <Table.Td className={`${classes.numCell} ${classes.mutedCell}`}>
                    {METRIC_BY_KEY.impressions.format(row.now.impressions)}
                  </Table.Td>
                  <Table.Td className={`${classes.numCell} ${classes.mutedCell}`}>
                    {METRIC_BY_KEY.ctr.format(row.now.ctr)}
                  </Table.Td>
                  <Table.Td className={classes.numCell}>
                    <PositionChip position={row.now.position} />
                  </Table.Td>
                  {onOpen && (
                    <Table.Td className={classes.chevronCell}>
                      <ChevronRight size={14} />
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </div>
    </section>
  );
}
