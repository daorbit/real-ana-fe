import { useState } from "react";
import { ConnectionGroup } from "@/features/auth/components/settings/ConnectionGroup";
import type { useClaudeConnection } from "../../hooks/useClaudeConnection";
import { CATEGORY_HINT, CATEGORY_TITLE } from "../../lib/catalog";
import { matchesFilter, type ConnectionFilter } from "../../lib/filter";
import { IntegrationTileCard } from "../IntegrationTileCard";
import { ClaudeModal } from "./ClaudeModal";

interface Props {
  claude: ReturnType<typeof useClaudeConnection>;
  workspaceName: string;
  lockedReason?: string;
  filter: ConnectionFilter;
  flat?: boolean;
}

export function ClaudeConnection({ claude, workspaceName, lockedReason, filter, flat }: Props) {
  const [open, setOpen] = useState(false);

  if (!claude.available || !matchesFilter(claude.entry, filter)) return null;

  const card = (
    <IntegrationTileCard
      tile={claude.tile}
      busy={claude.loading}
      lockedReason={lockedReason}
      onOpen={() => setOpen(true)}
    />
  );

  return (
    <>
      {flat ? (
        card
      ) : (
        <ConnectionGroup title={CATEGORY_TITLE.ai} hint={CATEGORY_HINT.ai}>
          {card}
        </ConnectionGroup>
      )}
      <ClaudeModal
        opened={open}
        workspaceName={workspaceName}
        mcpUrl={claude.mcpUrl}
        connections={claude.connections}
        revokingId={claude.revokingId}
        onClose={() => setOpen(false)}
        onRefresh={claude.refresh}
        onDisconnect={claude.disconnect}
      />
    </>
  );
}
