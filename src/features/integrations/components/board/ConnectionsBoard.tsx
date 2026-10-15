import { useMemo, useState } from "react";
import { SearchX } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { usePermissions, useWorkspace } from "@/features/workspace/context";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useFormsIntegrations } from "../../hooks/useFormsIntegrations";
import { useSocialConnections } from "../../hooks/useSocialConnections";
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
import { FormsIntegrations } from "../FormsIntegrations";
import { ConnectionGridSkeleton } from "./ConnectionCardSkeleton";
import { ConnectionsToolbar } from "./ConnectionsToolbar";

const SKELETON_CARDS = 8;
import { FormsNotice } from "./FormsNotice";
import { SocialGroup } from "./SocialGroup";

function formsLockReason(isDemo: boolean, hasWorkspace: boolean, canEdit: boolean): string | undefined {
  if (isDemo) return "Form apps are connected in your own workspace, not the demo.";
  if (!hasWorkspace) return "Pick a workspace to manage the apps its forms use.";
  if (!canEdit) return "Only editors and above can manage this workspace's form apps.";
  return undefined;
}

export function ConnectionsBoard() {
  const { isDemo } = useAuth();
  const { active } = useWorkspace();
  const { canEdit } = usePermissions();
  const workspaceId = active?._id ?? null;
  const lockedReason = formsLockReason(isDemo, Boolean(workspaceId), canEdit);
  const [filter, setFilter] = useState<ConnectionFilter>(EMPTY_FILTER);

  const social = useSocialConnections();
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

  const allEntries = useMemo(() => [...social.entries, ...formEntries], [social.entries, formEntries]);
  const counts = useMemo(() => countByStatus(allEntries, filter), [allEntries, filter]);
  const categories = useMemo(() => categoryOptions(allEntries), [allEntries]);

  const visibleSocial = social.entries.filter((entry) => matchesFilter(entry, filter));
  const visibleForms = formEntries.filter((entry) => matchesFilter(entry, filter));
  const loading = social.loading || (!lockedReason && integrations.loading);
  const formsSettled = Boolean(lockedReason) || (!integrations.loading && !integrations.failed);
  const nothingMatches = formsSettled && visibleSocial.length === 0 && visibleForms.length === 0;

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
            <SocialGroup entries={visibleSocial} canUseInstagram={social.canUseInstagram} flat />
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
          <SocialGroup entries={visibleSocial} canUseInstagram={social.canUseInstagram} />
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
