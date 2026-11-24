import { ScrollArea, Table } from "@mantine/core";
import { compact } from "@/shared/lib";
import { Pill } from "@/features/seo/components/shared/Pill";
import { INDEX_STATES, reasonHint, type IndexReason } from "../../indexing";
import { SearchSectionHead } from "../SearchSectionHead";
import layout from "../searchConsole.module.css";
import classes from "./indexing.module.css";

export function IndexReasonsTable({
  reasons,
  active,
  onOpen,
}: {
  reasons: IndexReason[];
  active: string | null;
  onOpen: (reason: string) => void;
}) {
  if (!reasons.length) return null;

  return (
    <section className={layout.group}>
      <SearchSectionHead
        title="Why pages aren't on Google"
        description="Google's own reason for each checked page. Tap one to list its pages below."
      />
      <div className={layout.listCard}>
        <ScrollArea className={layout.tableScroll}>
          <Table fz="xs" className={layout.table} highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Reason</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th className={layout.numCell}>Pages</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {reasons.map((row) => {
                const hint = reasonHint(row.reason);
                const state = INDEX_STATES[row.state];
                return (
                  <Table.Tr
                    key={row.reason}
                    className={layout.clickableRow}
                    aria-selected={row.reason === active}
                    onClick={() => onOpen(row.reason)}
                  >
                    <Table.Td className={classes.reasonCell}>
                      <span className={layout.strongCell}>{row.reason}</span>
                      {hint && <span className={classes.hint}>{hint}</span>}
                    </Table.Td>
                    <Table.Td>
                      <Pill tone={state.tone}>{state.label}</Pill>
                    </Table.Td>
                    <Table.Td className={`${layout.numCell} ${layout.strongCell}`}>{compact(row.pages)}</Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </div>
    </section>
  );
}
