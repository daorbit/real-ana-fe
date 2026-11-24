import { Button } from "@mantine/core";
import { ArrowRight, ExternalLink, Link2, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useGetBacklinkOverviewQuery } from "@/features/backlinks/api";
import { SummaryStrip } from "@/features/backlinks/components/SummaryStrip";
import { useBacklinkActions } from "@/features/backlinks/hooks/useBacklinkActions";
import { demoBacklinkOverview } from "@/features/demo/demoBacklinks";
import { useDemo } from "@/features/demo/context";
import { usePermissions } from "@/features/workspace/context";
import { errMessage } from "@/shared/lib/notify";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { LinksSkeleton } from "../SearchSkeletons";
import { LinkTables } from "./LinkTables";
import layout from "../searchConsole.module.css";
import classes from "./links.module.css";

const BACKLINKS_PATH = "/app/backlinks";

export function SearchLinksTab({
  workspaceId,
  siteId,
  propertyUrl,
}: {
  workspaceId: string;
  siteId: string;
  propertyUrl: string;
}) {
  const { canEdit } = usePermissions();
  const { demo } = useDemo();
  const real = useGetBacklinkOverviewQuery({ workspaceId, siteId }, { skip: demo });
  const { findNew, discovering } = useBacklinkActions(workspaceId, siteId, demo);
  const data = demo ? demoBacklinkOverview : real.currentData;
  const googleUrl = `https://search.google.com/search-console/links?resource_id=${encodeURIComponent(propertyUrl)}`;

  if (!data) {
    return real.error && !real.isFetching ? (
      <ErrorState
        compact
        title="Couldn't load links"
        description={errMessage(real.error, "Links to your site could not be loaded.")}
        onRetry={real.refetch}
        retrying={real.isFetching}
      />
    ) : (
      <LinksSkeleton />
    );
  }

  return (
    <div className={layout.section}>
      <div className={classes.bar}>
        <p className={classes.note}>
          Found by Quantalog from your visitors, pages you add and link data. Google keeps its own Links report in{" "}
          <a href={googleUrl} target="_blank" rel="noopener noreferrer" className={layout.learnMore}>
            Search Console <ExternalLink size={11} />
          </a>
          , so the numbers differ.
        </p>
        <div className={classes.actions}>
          <Button component={Link} to={BACKLINKS_PATH} variant="default" rightSection={<ArrowRight size={14} />}>
            Open Backlinks
          </Button>
          {canEdit && data.summary.total > 0 && (
            <Button leftSection={<Search size={15} />} loading={discovering} onClick={() => void findNew()}>
              Find new links
            </Button>
          )}
        </div>
      </div>

      {data.summary.total === 0 ? (
        <EmptyState
          compact
          icon={Link2}
          title="No links found yet"
          description={
            canEdit
              ? "Look through the last 90 days of your referrers for pages that link to you."
              : "Nobody has looked for links on this site yet. An editor can start it."
          }
          action={
            canEdit
              ? { label: "Find new links", icon: Search, onClick: () => void findNew(), loading: discovering }
              : undefined
          }
        />
      ) : (
        <>
          <SummaryStrip summary={data.summary} />
          <LinkTables profile={data.profiles.mine} pages={data.topPages ?? []} />
        </>
      )}
    </div>
  );
}
