import { useMemo, useState } from "react";
import { Button } from "@mantine/core";
import { motion } from "framer-motion";
import { RotateCw, ScrollText, ShieldCheck } from "lucide-react";
import { useGetMembersQuery } from "@/app/store";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useTitle } from "@/shared/lib/useTitle";
import { useWorkspace, usePermissions } from "@/features/workspace/context";
import { useDemo } from "@/features/demo/context";
import { demoMembersResponse } from "@/features/demo/demoWorkspace";
import type { AuditEntry, WorkspaceMember } from "@/shared/types";
import { useWorkspaceAudit } from "../hooks/useWorkspaceAudit";
import { AuditOverview } from "../components/AuditOverview";
import { AuditFilters } from "../components/AuditFilters";
import { AuditTimeline } from "../components/AuditTimeline";
import { AuditSkeleton, AuditOverviewSkeleton } from "../components/AuditSkeleton";
import { AuditEmpty } from "../components/AuditEmpty";
import { AuditDetailDrawer } from "../components/AuditDetailDrawer";
import classes from "../components/AuditLog.module.css";

const NO_MEMBERS: WorkspaceMember[] = [];

export default function AuditLog() {
  useTitle("Audit log");
  const { active } = useWorkspace();
  const { canAdmin } = usePermissions();
  const { demo } = useDemo();
  const workspaceId = active?._id ?? null;

  const audit = useWorkspaceAudit(workspaceId, { demo, enabled: canAdmin });
  const { data: membersData } = useGetMembersQuery(workspaceId ?? "", {
    skip: !workspaceId || !canAdmin || demo,
  });
  const members = useMemo(
    () => (demo ? demoMembersResponse().members : membersData?.members ?? NO_MEMBERS),
    [demo, membersData],
  );

  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const openDetail = (entry: AuditEntry) => {
    setSelected(entry);
    setDetailOpen(true);
  };

  if (!active) {
    return (
      <AppShell>
        <EmptyState
          icon={ScrollText}
          title="No workspace selected"
          description="Choose a workspace from the switcher to see what has changed in it."
          action={{ label: "Go to workspaces", to: "/app/workspaces" }}
        />
      </AppShell>
    );
  }

  if (!canAdmin) {
    return (
      <AppShell>
        <EmptyState
          icon={ShieldCheck}
          title="Only owners and admins can see the audit log"
          description={`Ask an admin of ${active.name} if you need to know who changed something.`}
          action={{ label: "See members", to: "/app/members" }}
        />
      </AppShell>
    );
  }

  const { data, overview } = audit;
  const items = data?.items ?? [];
  const filtered = Boolean(audit.category || audit.actor);
  const neverUsed = !filtered && overview?.summary.total === 0;

  return (
    <AppShell>
      <PageHeader
        title="Audit log"
        description={`A permanent record of who changed what in ${active.name}.`}
        actions={
          <Button
            variant="default"
            radius="md"
            leftSection={<RotateCw size={15} />}
            loading={audit.refreshing && !audit.loading}
            onClick={audit.reload}
          >
            Refresh
          </Button>
        }
      />

      <div className={classes.page}>
        {overview ? (
          <AuditOverview summary={overview.summary} retention={overview.retention} />
        ) : (
          !audit.failed && <AuditOverviewSkeleton />
        )}

        {audit.failed ? (
          <ErrorState compact title="Couldn't load the audit log" onRetry={audit.reload} />
        ) : neverUsed ? (
          <AuditEmpty filtered={false} onClear={audit.clearFilters} />
        ) : (
          <section>
            <AuditFilters
              summary={overview?.summary ?? null}
              category={audit.category}
              actor={audit.actor}
              members={members}
              onCategory={audit.setCategory}
              onActor={audit.setActor}
            />

            {audit.loading ? (
              <AuditSkeleton />
            ) : items.length === 0 ? (
              <AuditEmpty filtered={filtered} onClear={audit.clearFilters} />
            ) : (
              <motion.div
                key={`${workspaceId}-${audit.category ?? "all"}-${audit.actor ?? "anyone"}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.22 }}
              >
                <AuditTimeline
                  entries={items}
                  hasMore={Boolean(data?.nextCursor)}
                  loadingMore={audit.loadingMore}
                  onLoadMore={audit.loadMore}
                  onSelect={openDetail}
                  endNote="You've reached the start of this period."
                />
              </motion.div>
            )}
          </section>
        )}
      </div>

      <AuditDetailDrawer entry={selected} opened={detailOpen} onClose={() => setDetailOpen(false)} />
    </AppShell>
  );
}
