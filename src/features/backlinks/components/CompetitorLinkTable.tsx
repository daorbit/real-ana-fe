import { Badge, Table } from "@mantine/core";
import { timeAgo } from "@/shared/lib/format";
import type { CompetitorBacklink } from "../types";
import { ORIGIN_LABEL } from "../utils/labels";
import { AnchorCell, SourceCell } from "./BacklinkTable";
import { RelBadge } from "./LinkBadges";
import classes from "./Backlinks.module.css";

export function CompetitorLinkTable({ links, loading }: { links: CompetitorBacklink[]; loading: boolean }) {
  return (
    <section className={`${classes.card} ${classes.flush}`}>
      <div className={classes.cardHead}>
        <div>
          <h3 className={classes.cardTitle}>Their backlinks</h3>
          <p className={classes.cardSub}>Pages found linking to this competitor, strongest first.</p>
        </div>
      </div>
      {links.length === 0 ? (
        <div className={`${classes.tableWrap} ${classes.emptyRow}`}>
          {loading ? "Loading…" : "No backlinks found for this competitor yet."}
        </div>
      ) : (
        <div className={classes.tableWrap}>
          <Table className={classes.table} verticalSpacing="sm" horizontalSpacing="lg">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Linking page</Table.Th>
                <Table.Th>Anchor text</Table.Th>
                <Table.Th>Link</Table.Th>
                <Table.Th className={classes.num}>Authority</Table.Th>
                <Table.Th>Found via</Table.Th>
                <Table.Th>Seen</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {links.map((l) => (
                <Table.Tr key={l._id}>
                  <Table.Td>
                    <SourceCell url={l.sourceUrl} domain={l.sourceDomain} />
                  </Table.Td>
                  <Table.Td>
                    <AnchorCell text={l.anchorText} isImage={l.isImage} targetUrl={l.targetUrl} />
                  </Table.Td>
                  <Table.Td>
                    <div className={classes.badges}>
                      <RelBadge rel={l.rel} />
                      {l.status === "lost" && (
                        <Badge size="sm" variant="light" color="red" radius="sm">
                          Lost
                        </Badge>
                      )}
                    </div>
                  </Table.Td>
                  <Table.Td className={classes.num}>
                    {l.authority === null ? <span className={classes.muted}>—</span> : l.authority}
                  </Table.Td>
                  <Table.Td>
                    <span className={classes.muted}>{ORIGIN_LABEL[l.origin]}</span>
                  </Table.Td>
                  <Table.Td>
                    <span className={classes.muted}>{timeAgo(l.lastSeenAt)}</span>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      )}
    </section>
  );
}
