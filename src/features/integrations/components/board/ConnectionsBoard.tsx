import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useFormsIntegrations } from "../../hooks/useFormsIntegrations";
import { useSocialConnections } from "../../hooks/useSocialConnections";
import { useQuantalogApps } from "../../hooks/useQuantalogApps";
import { QuantalogAppsConnection } from "../quantalogApps/QuantalogAppsConnection";
import { CATEGORY_TITLE } from "../../lib/catalog";
import {
  EMPTY_FILTER,
  categoryOptions,
  countByStatus,
  matchesFilter,
  tileState,
  type ConnectionFilter,
  type Searchable,
} from "../../lib/filter";
import { useSearchConsoleConnection } from "../../hooks/useSearchConsoleConnection";
import { FormsIntegrations } from "../FormsIntegrations";
import { SearchConsoleConnection } from "../SearchConsoleConnection";
import { ConnectionGridSkeleton } from "./ConnectionCardSkeleton";
import { ConnectionsToolbar } from "./ConnectionsToolbar";
import { FormsNotice } from "./FormsNotice";
import { SocialGroup } from "./SocialGroup";

const SKELETON_CARDS = 8;

function formsLockReason(isDemo: boolean, hasWorkspace: boolean, canEdit: boolean): string | undefined {
  if (isDemo) return "Form apps are connected in your own workspace, not the demo.";
  if (!hasWorkspace) return "Pick a workspace to manage the apps its forms use.";
  if (!canEdit) return "Only editors and above can manage this workspace's form apps.";
  return undefined;
}

export function ConnectionsBoard() {
  const { isDemo } = useAuth();
  const { active } = useWorkspace();
  const { canEdit, canAdmin } = usePermissions();
  const workspaceId = active?._id ?? null;
  const lockedReason = formsLockReason(isDemo, Boolean(workspaceId), canEdit);
  const searchWorkspaceId = isDemo ? null : workspaceId;
  const [filter, setFilter] = useState<ConnectionFilter>(EMPTY_FILTER);

  const quantalogApps = useQuantalogApps();
  const social = useSocialConnections();
  const searchConsole = useSearchConsoleConnection(searchWorkspaceId);
  const integrations = useFormsIntegrations(lockedReason ? null : workspaceId);

  const formEntries = useMemo<Searchable[]>(
    () =>
      integrations.sections.flatMap((section) =>
        section.tiles.map((tile) => ({
          name: tile.name,
          description: tile.description,
          group: CATEGORY_TITLE[section.category],
          state: tileState(tile),
        })),
      ),
    [integrations.sections],
  );

  const searchEntry = searchConsole.entry;
  const allEntries = useMemo(
    () => [...quantalogApps.entries, ...social.entries, ...(searchEntry ? [searchEntry] : []), ...formEntries],
    [quantalogApps.entries, social.entries, searchEntry, formEntries],
  );
  const counts = useMemo(() => countByStatus(allEntries, filter), [allEntries, filter]);
  const categories = useMemo(() => categoryOptions(allEntries), [allEntries]);

  const visibleCount = allEntries.filter((entry) => matchesFilter(entry, filter)).length;
  const loading = social.loading || searchConsole.loading || (!lockedReason && integrations.loading);
  const formsSettled = Boolean(lockedReason) || (!integrations.loading && !integrations.failed);
  const nothingMatches = formsSettled && visibleCount === 0;
  const visibleSocial = social.entries.filter((entry) => matchesFilter(entry, filter));
  const searchCard = (flat: boolean) => (
    <SearchConsoleConnection
      workspaceId={searchWorkspaceId}
      searchConsole={searchConsole}
      canManage={canAdmin}
      filter={filter}
      flat={flat}
    />
  );

  return (
    <>
      <ConnectionsToolbar
        filter={filter}
        counts={loading ? undefined : counts}
        categories={categories}
        onChange={setFilter}
      />

      {loading ? (
        <ConnectionGridSkeleton count={SKELETON_CARDS} />
      ) : nothingMatches ? (
        <EmptyState
          compact
          icon={SearchX}
          title="No connections match"
          description={
            filter.query.trim()
              ? `Nothing matches "${filter.query.trim()}". Try another name, like Razorpay or Slack.`
              : "Nothing in this category is in this state right now."
          }
          action={{ label: "Clear filters", onClick: () => setFilter(EMPTY_FILTER) }}
        />
      ) : filter.status === "all" ? (
        <>
          <div className="connection-grid">
            <QuantalogAppsConnection quantalogApps={quantalogApps} filter={filter} flat />
            <SocialGroup entries={visibleSocial} canUseInstagram={social.canUseInstagram} flat />
            {searchCard(true)}
            <FormsIntegrations
              workspaceId={workspaceId}
              lockedReason={lockedReason}
              integrations={integrations}
              filter={filter}
              flat
            />
          </div>
          <FormsNotice lockedReason={lockedReason} failed={integrations.failed} onRetry={integrations.refetchAll} />
        </>
      ) : (
        <>
          <QuantalogAppsConnection quantalogApps={quantalogApps} filter={filter} />
          <SocialGroup entries={visibleSocial} canUseInstagram={social.canUseInstagram} />
          {searchCard(false)}
          <FormsIntegrations
            workspaceId={workspaceId}
            lockedReason={lockedReason}
            integrations={integrations}
            filter={filter}
          />
        </>
      )}
    </>
  );
}
