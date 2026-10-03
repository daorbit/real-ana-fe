import { Badge, Table } from "@mantine/core";
import type { GapRow } from "../types";
import { SOURCE_LABEL } from "../utils/labels";
import { SourceCell } from "./BacklinkTable";
import classes from "./Backlinks.module.css";

export function GapTable({ rows, emptyText }: { rows: GapRow[]; emptyText: string }) {
  if (rows.length === 0) return <div className={`${classes.tableWrap} ${classes.emptyRow}`}>{emptyText}</div>;

  return (
    <div className={classes.tableWrap}>
      <Table className={classes.table} verticalSpacing="sm" horizontalSpacing="lg">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Domain</Table.Th>
            <Table.Th>Type</Table.Th>
            <Table.Th>Links to</Table.Th>
            <Table.Th>Their anchor</Table.Th>
            <Table.Th className={classes.num}>Authority</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((r) => (
            <Table.Tr key={r.domain}>
              <Table.Td>
                <SourceCell url={r.sampleUrl} domain={r.domain} />
              </Table.Td>
              <Table.Td>
                <Badge size="sm" variant="light" color="gray" radius="sm">
                  {SOURCE_LABEL[r.kind]}
                </Badge>
              </Table.Td>
              <Table.Td>
                <div className={classes.chips}>
                  {r.competitors.map((c) => (
                    <span key={c.competitorId} className={classes.chip}>
                      {c.label}
                    </span>
                  ))}
                </div>
              </Table.Td>
              <Table.Td>
                <span className={classes.anchor}>{r.sampleAnchor || <span className={classes.muted}>—</span>}</span>
              </Table.Td>
              <Table.Td className={classes.num}>
                {r.authority === null ? <span className={classes.muted}>—</span> : r.authority}
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
