import type { CSSProperties } from "react";
import { Badge, ScrollArea, Table, Text } from "@mantine/core";
import { num } from "@/shared/lib";
import type { UsageHistoryMonth } from "@/shared/types";
import { monthLabel, usageShare } from "../../lib/usageMonth";
import classes from "./UsageOverview.module.css";

type Column = { key: keyof Pick<UsageHistoryMonth, "audits" | "crawls" | "inspections" | "formSubmissions" | "orbit">; label: string };

const COLUMNS: Column[] = [
  { key: "audits", label: "SEO audits" },
  { key: "crawls", label: "Site crawls" },
  { key: "inspections", label: "Index checks" },
  { key: "formSubmissions", label: "Form responses" },
  { key: "orbit", label: "Orbit questions" },
];

export function MonthlyUsageTable({ months }: { months: UsageHistoryMonth[] }) {
  const columns = COLUMNS.filter((c) => months.some((m) => m[c.key] > 0));

  return (
    <section className={classes.card}>
      <header className={classes.cardHead}>
        <div>
          <Text fw={650} size="sm">
            Monthly usage
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            Everything this workspace used, month by month. Each month shows the plan it ended on.
          </Text>
        </div>
      </header>

      <ScrollArea className={classes.tableScroll}>
        <Table verticalSpacing={10} fz="xs" className={classes.table} highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Month</Table.Th>
              <Table.Th>Plan</Table.Th>
              <Table.Th className={classes.num}>Events</Table.Th>
              {columns.map((c) => (
                <Table.Th key={c.key} className={classes.num}>
                  {c.label}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {months.map((m) => {
              const share = usageShare(m.events, m.eventQuota);
              return (
                <Table.Tr key={m.month}>
                  <Table.Td>
                    <span className={classes.monthCell}>
                      {monthLabel(m.month)}
                      {m.current && (
                        <Badge size="xs" variant="light" color="emerald">
                          Current
                        </Badge>
                      )}
                    </span>
                  </Table.Td>
                  <Table.Td>{m.plan.name}</Table.Td>
                  <Table.Td>
                    <div className={classes.eventsCell}>
                      <span className={classes.miniMeter}>
                        <span
                          className={classes.meterFill}
                          data-state={share >= 100 ? "over" : share >= 80 ? "near" : undefined}
                          style={{ "--share": `${share}%` } as CSSProperties}
                        />
                      </span>
                      <span>
                        {num(m.events)} <Text span c="dimmed" size="xs">/ {num(m.eventQuota)}</Text>
                      </span>
                    </div>
                  </Table.Td>
                  {columns.map((c) => (
                    <Table.Td key={c.key} className={classes.num}>
                      {m[c.key] ? num(m[c.key]) : "—"}
                    </Table.Td>
                  ))}
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </section>
  );
}
