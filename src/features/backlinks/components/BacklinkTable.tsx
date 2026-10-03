import { ActionIcon, Table, Tooltip } from "@mantine/core";
import { ExternalLink, RotateCw, Trash2 } from "lucide-react";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import { timeAgo } from "@/shared/lib/format";
import type { Backlink } from "../types";
import { ORIGIN_LABEL, pathOf } from "../utils/labels";
import { RelBadge, StatusBadge } from "./LinkBadges";
import classes from "./Backlinks.module.css";

export function SourceCell({ url, domain }: { url: string; domain: string }) {
  return (
    <div className={classes.source}>
      <SiteFavicon domain={domain} size={18} />
      <div className={classes.sourceText}>
        <div className={classes.domain}>{domain}</div>
        <a className={classes.path} href={url} target="_blank" rel="noopener noreferrer">
          <span className={classes.pathText}>{pathOf(url)}</span>
          <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}

export function AnchorCell({ text, isImage, targetUrl }: { text: string; isImage: boolean; targetUrl?: string }) {
  return (
    <>
      <span className={classes.anchor} title={text}>
        {text || <span className={classes.muted}>{isImage ? "Image link" : "No anchor text"}</span>}
      </span>
      {targetUrl && <span className={`${classes.anchor} ${classes.muted}`}>→ {pathOf(targetUrl)}</span>}
    </>
  );
}

export function BacklinkTable({
  backlinks,
  canEdit,
  recheckingId,
  onRecheck,
  onRemove,
  emptyText,
}: {
  backlinks: Backlink[];
  canEdit: boolean;
  recheckingId: string | null;
  onRecheck: (id: string) => void;
  onRemove: (id: string, domain: string) => void;
  emptyText: string;
}) {
  if (backlinks.length === 0) return <div className={`${classes.tableWrap} ${classes.emptyRow}`}>{emptyText}</div>;

  return (
    <div className={classes.tableWrap}>
      <Table className={classes.table} verticalSpacing="sm" horizontalSpacing="lg">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Linking page</Table.Th>
            <Table.Th>Anchor text</Table.Th>
            <Table.Th>Link</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th className={classes.num}>Visits</Table.Th>
            <Table.Th>Checked</Table.Th>
            {canEdit && <Table.Th />}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {backlinks.map((b) => (
            <Table.Tr key={b._id}>
              <Table.Td>
                <SourceCell url={b.sourceUrl} domain={b.sourceDomain} />
              </Table.Td>
              <Table.Td>
                <AnchorCell text={b.anchorText} isImage={b.isImage} targetUrl={b.status === "live" ? b.targetUrl : undefined} />
              </Table.Td>
              <Table.Td>
                <div className={classes.badges}>
                  {b.status === "live" || b.lastLiveAt ? <RelBadge rel={b.rel} /> : <span className={classes.muted}>—</span>}
                </div>
              </Table.Td>
              <Table.Td>
                <StatusBadge status={b.status} error={b.lastError} />
              </Table.Td>
              <Table.Td className={classes.num}>
                {b.referralVisits > 0 ? b.referralVisits.toLocaleString() : <span className={classes.muted}>—</span>}
              </Table.Td>
              <Table.Td>
                <Tooltip label={ORIGIN_LABEL[b.origin]} withArrow>
                  <span className={classes.muted}>{b.lastCheckedAt ? timeAgo(b.lastCheckedAt) : "Not yet"}</span>
                </Tooltip>
              </Table.Td>
              {canEdit && (
                <Table.Td>
                  <div className={classes.rowActions}>
                    <Tooltip label="Check this page again" withArrow>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        loading={recheckingId === b._id}
                        onClick={() => onRecheck(b._id)}
                        aria-label="Check this page again"
                      >
                        <RotateCw size={15} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label="Stop tracking" withArrow>
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        onClick={() => onRemove(b._id, b.sourceDomain)}
                        aria-label="Stop tracking"
                      >
                        <Trash2 size={15} />
                      </ActionIcon>
                    </Tooltip>
                  </div>
                </Table.Td>
              )}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
