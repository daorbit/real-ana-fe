import type { ReactNode } from "react";
import { ScrollArea, Table } from "@mantine/core";
import { SearchSectionHead } from "./SearchSectionHead";
import classes from "./searchConsole.module.css";

export type CountRow = { key: string; label: ReactNode; title?: string; values: ReactNode[] };

export function SearchCountTable({
  title,
  description,
  labelHeader,
  valueHeaders,
  rows,
  emptyText,
}: {
  title: string;
  description: string;
  labelHeader: string;
  valueHeaders: string[];
  rows: CountRow[];
  emptyText: string;
}) {
  return (
    <section className={classes.group}>
      <SearchSectionHead title={title} description={description} />
      <div className={classes.listCard}>
        {rows.length === 0 ? (
          <p className={classes.emptyRow}>{emptyText}</p>
        ) : (
          <ScrollArea className={classes.tableScroll}>
            <Table fz="xs" className={classes.table}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{labelHeader}</Table.Th>
                  {valueHeaders.map((header) => (
                    <Table.Th key={header} className={classes.numCell}>
                      {header}
                    </Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => (
                  <Table.Tr key={row.key}>
                    <Table.Td className={classes.topLabelCell} title={row.title}>
                      {row.label}
                    </Table.Td>
                    {row.values.map((value, i) => (
                      <Table.Td key={valueHeaders[i]} className={classes.numCell}>
                        {value}
                      </Table.Td>
                    ))}
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
