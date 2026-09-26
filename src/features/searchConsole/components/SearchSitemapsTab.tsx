import { Alert, Anchor, Badge, ScrollArea, Skeleton, Table, Text } from "@mantine/core";
import { AlertTriangle, CheckCircle2, Clock, ExternalLink, XCircle } from "lucide-react";
import { useGetSearchSitemapsQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { num, timeAgo } from "@/shared/lib";
import type { SearchSitemap } from "@/shared/types";
import classes from "./searchConsole.module.css";

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
  const { data, isLoading, error } = useGetSearchSitemapsQuery({ workspaceId, siteId });
  const consoleUrl = `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(propertyUrl)}`;

  if (isLoading) return <Skeleton height={240} radius="md" />;
  if (error || !data) {
    return (
      <Alert color="red" variant="light" icon={<AlertTriangle size={16} />}>
        {errMessage(error, "Sitemaps could not be loaded.")}
      </Alert>
    );
  }

  return (
    <div className={classes.card}>
      <div className={classes.cardHead}>
        <div>
          <Text fw={650} size="sm">
            Sitemap coverage
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            This is sitemap coverage data, not a Google property-wide indexed-page total.
          </Text>
        </div>
        <Anchor href={consoleUrl} target="_blank" rel="noopener noreferrer" size="xs">
          Submit a sitemap <ExternalLink size={11} />
        </Anchor>
      </div>

      {data.sitemaps.length === 0 ? (
        <Text size="sm" c="dimmed">
          No sitemaps have been submitted for this property. Submitting one helps Google find every page.
        </Text>
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
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.sitemaps.map((s) => (
                <Table.Tr key={s.path}>
                  <Table.Td className={classes.labelCell} title={s.path}>
                    <a href={s.path} target="_blank" rel="noopener noreferrer" className={classes.pageLink}>
                      {s.path.replace(/^https?:\/\/[^/]+/, "") || s.path}
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
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}
    </div>
  );
}
