import { Drawer, ScrollArea, Table, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ChevronRight, Lightbulb } from "lucide-react";
import { insightLabel, type InsightDef, type InsightItem } from "../insightDefs";
import classes from "./insights.module.css";
import tableClasses from "./searchConsole.module.css";

export function SearchInsightPanel({
  def,
  rows,
  onClose,
  onOpen,
}: {
  def: InsightDef | null;
  rows: InsightItem[];
  onClose: () => void;
  onOpen: (row: InsightItem) => void;
}) {
  const phone = useMediaQuery("(max-width: 48em)") ?? false;
  const Icon = def?.icon;

  return (
    <Drawer
      opened={Boolean(def)}
      onClose={onClose}
      position={phone ? "bottom" : "right"}
      size={phone ? "90%" : 720}
      radius={phone ? "lg" : 0}
      title={
        def &&
        Icon && (
          <div className={classes.drawerHead}>
            <span className={classes.icon} data-tone={def.tone}>
              <Icon size={16} />
            </span>
            <div>
              <Text fw={700} size="md">
                {def.title}
              </Text>
              <Text size="xs" c="dimmed">
                {def.description}
              </Text>
            </div>
          </div>
        )
      }
    >
      {def && (
        <div className={classes.drawerBody}>
          <div className={classes.action}>
            <Lightbulb size={15} />
            <Text size="sm">
              <b>What to do:</b> {def.action}
            </Text>
          </div>

          <ScrollArea>
            <Table verticalSpacing={9} fz="xs" className={tableClasses.table} highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th className={tableClasses.rankCell}>#</Table.Th>
                  <Table.Th>{def.dimension === "page" ? "Page" : "Query"}</Table.Th>
                  {def.columns.map((c) => (
                    <Table.Th key={c.label} className={tableClasses.numCell}>
                      {c.label}
                    </Table.Th>
                  ))}
                  <Table.Th />
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row, i) => (
                  <Table.Tr key={`${row.key}-${i}`} className={tableClasses.clickableRow} onClick={() => onOpen(row)}>
                    <Table.Td className={tableClasses.rankCell}>{i + 1}</Table.Td>
                    <Table.Td className={tableClasses.labelCell} title={row.key}>
                      {insightLabel(def, row)}
                    </Table.Td>
                    {def.columns.map((c) => (
                      <Table.Td key={c.label} className={tableClasses.numCell}>
                        {c.render(row)}
                      </Table.Td>
                    ))}
                    <Table.Td className={tableClasses.chevronCell}>
                      <ChevronRight size={14} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </div>
      )}
    </Drawer>
  );
}
