import { useMemo, useState } from "react";
import { Button, ScrollArea, Table, Text, TextInput } from "@mantine/core";
import { ArrowRight, Search } from "lucide-react";
import type { SearchMetrics } from "@/shared/types";
import { METRICS } from "../searchMetrics";
import classes from "./searchConsole.module.css";

export type TopRow = SearchMetrics & { label: string; href?: string };

export function SearchTopTable({
  title,
  description,
  labelHeader,
  rows,
  emptyText,
  onViewAll,
}: {
  title: string;
  description: string;
  labelHeader: string;
  rows: TopRow[];
  emptyText: string;
  onViewAll?: () => void;
}) {
  const [filter, setFilter] = useState("");

  const shown = useMemo(() => {
    const q = filter.trim().toLowerCase();
    return q ? rows.filter((r) => r.label.toLowerCase().includes(q)) : rows;
  }, [rows, filter]);

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
        {onViewAll ? (
          <Button variant="subtle" size="compact-sm" rightSection={<ArrowRight size={13} />} onClick={onViewAll}>
            View all
          </Button>
        ) : (
          rows.length > 12 && (
            <TextInput
              size="xs"
              placeholder="Filter"
              leftSection={<Search size={13} />}
              value={filter}
              onChange={(e) => setFilter(e.currentTarget.value)}
              aria-label={`Filter ${title.toLowerCase()}`}
            />
          )
        )}
      </div>

      {shown.length === 0 ? (
        <Text size="sm" c="dimmed">
          {rows.length ? "Nothing matches that filter." : emptyText}
        </Text>
      ) : (
        <ScrollArea.Autosize mah={380} className={classes.tableScroll}>
          <Table verticalSpacing={8} fz="xs" className={classes.table} highlightOnHover stickyHeader>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>{labelHeader}</Table.Th>
                {METRICS.map((m) => (
                  <Table.Th key={m.key} className={classes.numCell}>
                    {m.key === "position" ? "Pos." : m.label}
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {shown.map((row, i) => (
                <Table.Tr key={`${row.href ?? row.label}-${i}`}>
                  <Table.Td className={classes.labelCell} title={row.label}>
                    {row.href ? (
                      <a href={row.href} target="_blank" rel="noopener noreferrer" className={classes.pageLink}>
                        {row.label}
                      </a>
                    ) : (
                      row.label
                    )}
                  </Table.Td>
                  {METRICS.map((m) => (
                    <Table.Td key={m.key} className={classes.numCell}>
                      {m.format(row[m.key])}
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
