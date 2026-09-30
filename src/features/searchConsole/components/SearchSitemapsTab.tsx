import { Alert, Text } from "@mantine/core";
import { AlertTriangle, ExternalLink, FileText } from "lucide-react";
import { useGetSearchSitemapsQuery } from "@/app/store";
import { usePermissions } from "@/features/workspace/context";
import { errMessage } from "@/shared/lib/notify";
import { num } from "@/shared/lib";
import { useSearchConsoleConnect } from "../useSearchConsoleConnect";
import { useSitemapActions } from "../useSitemapActions";
import { sitemapBase } from "../sitemapUrl";
import { SitemapsSkeleton } from "./SearchSkeletons";
import { SitemapSubmitBar } from "./SitemapSubmitBar";
import { SitemapRow } from "./SitemapRow";
import classes from "./sitemaps.module.css";

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
  const pages = data.sitemaps.reduce((sum, s) => sum + s.submitted, 0);

  return (
    <div className={classes.root}>
      <header className={classes.head}>
        <div>
          <div className={classes.title}>Sitemaps</div>
          <div className={classes.subtitle}>Tell Google where your pages are, and see when it last read them.</div>
        </div>
        <a href={consoleUrl} target="_blank" rel="noopener noreferrer" className={classes.consoleLink}>
          Open in Search Console <ExternalLink size={12} />
        </a>
      </header>

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
        <div className={classes.empty}>
          <span className={classes.emptyIcon}>
            <FileText size={20} />
          </span>
          <Text size="sm" fw={600}>
            No sitemaps yet
          </Text>
          <Text size="xs" c="dimmed">
            {manage
              ? "Add one above so Google can find every page on your site."
              : "Submitting a sitemap helps Google find every page on your site."}
          </Text>
        </div>
      ) : (
        <div className={classes.listCard}>
          <div className={classes.listHead}>
            <span className={classes.eyebrow}>Submitted sitemaps</span>
            <span className={classes.listCount}>
              {data.sitemaps.length} sitemap{data.sitemaps.length === 1 ? "" : "s"}
              {pages ? ` · ${num(pages)} pages` : ""}
            </span>
          </div>
          <ul className={classes.list}>
            {data.sitemaps.map((s) => (
              <SitemapRow
                key={s.path}
                sitemap={s}
                manage={manage}
                busy={actions.pendingUrl === s.path}
                onResubmit={() => void actions.submit(s.path, true)}
                onRemove={() => actions.remove(s.path)}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
