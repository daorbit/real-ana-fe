import { Fragment, useMemo, useState } from "react";
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
import { useAiAssistants } from "../../hooks/useAiAssistants";
import { AiAssistantsConnection } from "../assistants/AiAssistantsConnection";
import { FormsIntegrations } from "../FormsIntegrations";
import { SearchConsoleConnection } from "../SearchConsoleConnection";
import { ConnectionCardSkeleton, ConnectionGridSkeleton } from "./ConnectionCardSkeleton";
import { ConnectionsToolbar } from "./ConnectionsToolbar";
import { SocialGroup } from "./SocialGroup";

const SKELETON_CARDS = 8;
const FORMS_SKELETON_CARDS = 4;

function FormsSkeletons() {
  return (
    <>
      {Array.from({ length: FORMS_SKELETON_CARDS }, (_, index) => (
        <ConnectionCardSkeleton key={index} />
      ))}
    </>
  );
}

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
  const assistants = useAiAssistants(workspaceId, !isDemo);

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
  const assistantEntries = useMemo(
    () => (assistants.available ? assistants.items.map((item) => item.entry) : []),
    [assistants.available, assistants.items],
  );
  const allEntries = useMemo(
    () => [
      ...quantalogApps.entries,
      ...assistantEntries,
      ...social.entries,
      ...(searchEntry ? [searchEntry] : []),
      ...formEntries,
    ],
    [quantalogApps.entries, assistantEntries, social.entries, searchEntry, formEntries],
  );
  const counts = useMemo(() => countByStatus(allEntries, filter), [allEntries, filter]);
  const categories = useMemo(() => categoryOptions(allEntries), [allEntries]);

  const visibleCount = allEntries.filter((entry) => matchesFilter(entry, filter)).length;
  const coreLoading = social.loading || searchConsole.loading || assistants.loading;
  const formsLoading = !lockedReason && integrations.loading;
  const loading = coreLoading || formsLoading;
  const assistantCards = (
    <AiAssistantsConnection
      assistants={assistants}
      workspaceName={active?.name ?? ""}
      lockedReason={workspaceId ? undefined : "Pick a workspace to connect an AI assistant to it."}
      filter={filter}
    />
  );
  const formsSettled = Boolean(lockedReason) || (!integrations.loading && !integrations.failed);
  const nothingMatches = formsSettled && visibleCount === 0;
  const visibleSocial = social.entries.filter((entry) => matchesFilter(entry, filter));
  const searchCard = (
    <SearchConsoleConnection
      workspaceId={searchWorkspaceId}
      searchConsole={searchConsole}
      canManage={canAdmin}
      filter={filter}
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

      <Fragment key={workspaceId ?? "none"}>
      {coreLoading ? (
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
      ) : (
        <>
          <QuantalogAppsConnection quantalogApps={quantalogApps} filter={filter} />
          {assistantCards}
          {visibleSocial.length > 0 && (
            <SocialGroup entries={visibleSocial} canUseInstagram={social.canUseInstagram} />
          )}
          {searchCard}
          <FormsIntegrations
            workspaceId={workspaceId}
            lockedReason={lockedReason}
            integrations={integrations}
            filter={filter}
          />
          {formsLoading && (
            <div className="connection-grid" aria-busy="true">
              <FormsSkeletons />
            </div>
          )}
        </>
      )}
      </Fragment>
    </>
  );
}
