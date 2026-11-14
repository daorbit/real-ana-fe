import { useState } from "react";
import { Button } from "@mantine/core";
import { PanelSkeleton } from "@/shared/ui/Skeletons";
import { History } from "lucide-react";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useRadarList } from "../hooks/useRadarData";
import { OpportunityGroup } from "./OpportunityRow";
import { ScanHistory } from "./ScanHistory";
import { SectionHeader } from "./SectionHeader";
import classes from "./GrowthRadar.module.css";

function HistoryPage({
  workspaceId,
  before,
  last,
  onMore,
}: {
  workspaceId: string;
  before: string | undefined;
  last: boolean;
  onMore: (next: string) => void;
}) {
  const { list, loading, fetching } = useRadarList(workspaceId, "history", before, true);
  if (loading) return <PanelSkeleton height={200} />;
  if (!list?.items.length) {
    return before ? null : (
      <EmptyState
        compact
        icon={History}
        title="No closed findings yet"
        description="Findings you resolve or dismiss, and ones that stay away for 14 days, are kept here."
      />
    );
  }
  return (
    <>
      <OpportunityGroup cards={list.items} closed />
      {last && list.nextBefore && (
        <Button className={classes.loadMore} variant="default" loading={fetching} onClick={() => onMore(list.nextBefore!)}>
          Show older
        </Button>
      )}
    </>
  );
}

export function HistoryTab({ workspaceId, historyDays }: { workspaceId: string; historyDays: number }) {
  const [cursors, setCursors] = useState<(string | undefined)[]>([undefined]);

  return (
    <div className={classes.page}>
      <section className={classes.section}>
        <SectionHeader
          title="Closed findings"
          help="Resolved, dismissed and archived findings. A resolved finding reopens on its own if the pattern comes back."
          aside={<span className={classes.sectionNote}>Last {historyDays} days on your plan</span>}
        />
        {cursors.map((before, i) => (
          <HistoryPage
            key={before ?? "first"}
            workspaceId={workspaceId}
            before={before}
            last={i === cursors.length - 1}
            onMore={(next) => setCursors((list) => [...list, next])}
          />
        ))}
      </section>
      <ScanHistory workspaceId={workspaceId} />
    </div>
  );
}
