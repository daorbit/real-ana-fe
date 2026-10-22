import { useState } from "react";
import { ConnectionGroup } from "@/features/auth/components/settings/ConnectionGroup";
import type { useSearchConsoleConnection } from "../hooks/useSearchConsoleConnection";
import { CATEGORY_HINT, CATEGORY_TITLE } from "../lib/catalog";
import { matchesFilter, type ConnectionFilter } from "../lib/filter";
import { IntegrationTileCard } from "./IntegrationTileCard";
import { SearchConsoleModal } from "./SearchConsoleModal";

interface Props {
  workspaceId: string | null;
  searchConsole: ReturnType<typeof useSearchConsoleConnection>;
  canManage: boolean;
  filter: ConnectionFilter;
}

export function SearchConsoleConnection({ workspaceId, searchConsole, canManage, filter }: Props) {
  const [open, setOpen] = useState(false);
  const { tile, entry, status, busy } = searchConsole;

  if (!tile || !entry || !workspaceId || !matchesFilter(entry, filter)) return null;

  const lockedReason = !canManage && !tile.connected ? "Only workspace admins can connect Google Search Console." : undefined;

  const card = (
    <IntegrationTileCard tile={tile} busy={busy} lockedReason={lockedReason} onOpen={() => setOpen(true)} />
  );

  return (
    <>
      <ConnectionGroup title={CATEGORY_TITLE.search} hint={CATEGORY_HINT.search}>
        {card}
      </ConnectionGroup>
      <SearchConsoleModal
        opened={open}
        workspaceId={workspaceId}
        status={status}
        busy={busy}
        canManage={canManage}
        onClose={() => setOpen(false)}
        onConnect={searchConsole.connect}
        onDisconnect={() => searchConsole.disconnect(() => setOpen(false))}
      />
    </>
  );
}
