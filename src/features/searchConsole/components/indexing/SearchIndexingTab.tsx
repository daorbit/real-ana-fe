import { useMemo, useState } from "react";
import { useGetSearchIndexingQuery } from "@/app/store";
import { errMessage } from "@/shared/lib/notify";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useDemo } from "@/features/demo/context";
import { demoSearchIndexing } from "@/features/demo/demoSearchIndexing";
import { indexCounts, indexReasons, richResultGroups, type IndexFilter } from "../../indexing";
import { useSearchEntitlements } from "../../useSearchEntitlements";
import { IndexingSkeleton } from "../SearchSkeletons";
import { SearchLockedFeature } from "../SearchUpgradeNote";
import { IndexHeadline } from "./IndexHeadline";
import { IndexTiles } from "./IndexTiles";
import { IndexReasonsTable } from "./IndexReasonsTable";
import { IndexPagesTable } from "./IndexPagesTable";
import { IndexRichResults } from "./IndexRichResults";
import classes from "../searchConsole.module.css";

export function SearchIndexingTab({
  workspaceId,
  siteId,
  propertyUrl,
  onOpenPage,
}: {
  workspaceId: string;
  siteId: string;
  propertyUrl: string;
  onOpenPage: (url: string) => void;
}) {
  const ent = useSearchEntitlements();
  const { demo } = useDemo();
  const locked = !demo && !ent.canInspect && ent.inspectionQuota === 0;
  const [filter, setFilter] = useState<IndexFilter>("all");
  const [reason, setReason] = useState<string | null>(null);

  const real = useGetSearchIndexingQuery({ workspaceId, siteId }, { skip: demo || locked });
  const sample = useMemo(() => (demo ? demoSearchIndexing() : null), [demo]);
  const data = sample ?? real.currentData;

  if (locked) {
    return (
      <SearchLockedFeature
        title="See which pages Google left out"
        description="Check your sitemap and top pages with Google, grouped by the reason each one isn't indexed. Included from the Starter plan."
        preview={<IndexingSkeleton />}
      />
    );
  }

  if (!data) {
    return real.error && !real.isFetching ? (
      <ErrorState
        compact
        title="Couldn't load indexing"
        description={errMessage(real.error, "Your pages could not be loaded.")}
        onRetry={real.refetch}
        retrying={real.isFetching}
      />
    ) : (
      <IndexingSkeleton />
    );
  }

  const counts = indexCounts(data.pages);
  const changeFilter = (next: IndexFilter) => {
    setFilter(next);
    setReason(null);
  };
  const openReason = (next: string) => {
    setFilter("all");
    setReason((current) => (current === next ? null : next));
  };

  return (
    <div className={classes.section}>
      <IndexHeadline
        workspaceId={workspaceId}
        siteId={siteId}
        propertyUrl={propertyUrl}
        counts={counts}
        sitemapPages={data.sitemapPages}
      />
      <IndexTiles counts={counts} onPick={changeFilter} />
      <IndexReasonsTable reasons={indexReasons(data.pages)} active={reason} onOpen={openReason} />
      <IndexPagesTable
        pages={data.pages}
        days={data.days}
        counts={counts}
        filter={filter}
        reason={reason}
        onFilterChange={changeFilter}
        onClearReason={() => setReason(null)}
        onOpenPage={onOpenPage}
      />
      <IndexRichResults groups={richResultGroups(data.pages)} />
    </div>
  );
}
