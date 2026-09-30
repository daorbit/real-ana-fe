import { Alert, Anchor, Badge, ScrollArea, Table, Text } from "@mantine/core";
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, XCircle } from "lucide-react";
import { useGetSearchSitemapsQuery } from "@/app/store";
import { usePermissions } from "@/features/workspace/context";
import { errMessage } from "@/shared/lib/notify";
import { num, timeAgo } from "@/shared/lib";
import type { SearchSitemap } from "@/shared/types";
import { useSearchConsoleConnect } from "../useSearchConsoleConnect";
import { useSitemapActions } from "../useSitemapActions";
import { sitemapBase, sitemapPath } from "../sitemapUrl";
import { SitemapsSkeleton } from "./SearchSkeletons";
import { SitemapSubmitBar } from "./SitemapSubmitBar";
import { SitemapRowActions } from "./SitemapRowActions";
import classes from "./searchConsole.module.css";
import sitemapClasses from "./sitemaps.module.css";

function SitemapStatus({ sitemap }: { sitemap: SearchSitemap }) {
  if (sitemap.errors > 0) {
    return (
      <Badge color="red" variant="light" leftSection={<XCircle size={11} />}>
        {sitemap.errors} error{sitemap.errors === 1 ? "" : "s"}
      </Badge>
    );
  }
  if (sitemap.isPending) {
    return (
      <Badge color="gray" variant="light" leftSection={<Clock size={11} />}>
        Pending
      </Badge>
    );
  }
  if (sitemap.warnings > 0) {
    return (
      <Badge color="yellow" variant="light" leftSection={<AlertTriangle size={11} />}>
        {sitemap.warnings} warning{sitemap.warnings === 1 ? "" : "s"}
      </Badge>
    );
  }
  return (
    <Badge color="teal" variant="light" leftSection={<CheckCircle2 size={11} />}>
      Success
    </Badge>
  );
}

export function SearchSitemapsTab({
  workspaceId,
  siteId,
  propertyUrl,
}: {
  workspaceId: string;
  siteId: string;
  propertyUrl: string;
}) {
  const { canAdmin } = usePermissions();
  const { data, isLoading, error, refetch } = useGetSearchSitemapsQuery({ workspaceId, siteId });
  const { connect, connecting } = useSearchConsoleConnect(workspaceId, () => void refetch());
  const actions = useSitemapActions(workspaceId, siteId);
  const consoleUrl = `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(propertyUrl)}`;

  if (isLoading) return <SitemapsSkeleton />;
  if (error || !data) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Sitemaps could not be loaded.")}
      </Alert>
    );
  }

  const manage = canAdmin && data.access.canSubmit;

  return (
    <div className={classes.card}>
      <div className={classes.cardHead}>
        <div>
          <Text fw={650} size="sm">
            Sitemaps
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            Tell Google where your pages are. Coverage here is per sitemap, not a property-wide index total.
          </Text>
        </div>
        <Anchor href={consoleUrl} target="_blank" rel="noopener noreferrer" size="xs">
          Open in Search Console <ExternalLink size={11} />
        </Anchor>
      </div>

      {canAdmin && (
        <SitemapSubmitBar
          base={sitemapBase(propertyUrl)}
          access={data.access}
          submitting={actions.submitting}
          onSubmit={(url) => actions.submit(url)}
          onReconnect={connect}
          reconnecting={connecting}
        />
      )}

      {data.sitemaps.length === 0 ? (
        <div className={sitemapClasses.empty}>
          <Text size="sm" fw={600}>
            No sitemaps yet
          </Text>
          <Text size="xs" c="dimmed">
            {manage
              ? "Submit one above so Google can find every page on your site."
              : "Submitting a sitemap helps Google find every page on your site."}
          </Text>
        </div>
      ) : (
        <ScrollArea className={classes.tableScroll}>
          <Table verticalSpacing={10} fz="xs" className={classes.table} highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Sitemap</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th className={classes.numCell}>Pages submitted</Table.Th>
                <Table.Th>Last submitted</Table.Th>
                <Table.Th>Last read by Google</Table.Th>
                {manage && <Table.Th className={sitemapClasses.actionsCell} aria-label="Actions" />}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.sitemaps.map((s) => (
                <Table.Tr key={s.path}>
                  <Table.Td className={classes.labelCell} title={s.path}>
                    <a href={s.path} target="_blank" rel="noopener noreferrer" className={classes.pageLink}>
                      {sitemapPath(s.path)}
                    </a>
                    {s.isIndex && (
                      <Badge size="xs" variant="light" color="gray" ml={6}>
                        Index
                      </Badge>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <SitemapStatus sitemap={s} />
                  </Table.Td>
                  <Table.Td className={classes.numCell}>{s.submitted ? num(s.submitted) : "—"}</Table.Td>
                  <Table.Td>{s.lastSubmitted ? timeAgo(s.lastSubmitted) : "—"}</Table.Td>
                  <Table.Td>{s.lastDownloaded ? timeAgo(s.lastDownloaded) : "Not yet"}</Table.Td>
                  {manage && (
                    <Table.Td className={sitemapClasses.actionsCell}>
                      <SitemapRowActions
                        busy={actions.pendingUrl === s.path}
                        onResubmit={() => void actions.submit(s.path, true)}
                        onRemove={() => actions.remove(s.path)}
                      />
                    </Table.Td>
                  )}
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}
