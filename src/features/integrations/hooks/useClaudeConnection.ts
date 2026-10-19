import { useMemo } from "react";
import { useConnectedApps } from "@/features/connectors/hooks/useConnectedApps";
import { confirmDelete } from "@/shared/lib/notify";
import { timeAgo } from "@/shared/lib/format";
import type { ConnectedApp } from "@/features/connectors/lib/connectorApi";
import { CATEGORY_TITLE } from "../lib/catalog";
import { tileState, type Searchable } from "../lib/filter";
import type { IntegrationTile } from "../types";

export const CLAUDE_ID = "claude";

function toTile(connections: ConnectedApp[]): IntegrationTile {
  const latest = connections
    .map((c) => c.lastUsedAt ?? c.connectedAt)
    .sort()
    .at(-1);
  const count = connections.length;
  return {
    kind: "claude",
    id: CLAUDE_ID,
    name: "Claude",
    category: "ai",
    description: "Ask Claude about your forms, leads, bookings and website traffic. Read-only, per workspace.",
    connected: count > 0,
    enabled: count > 0,
    account: count ? `${count} connection${count === 1 ? "" : "s"}` : undefined,
    lastUsedAt: latest,
  };
}

export function useClaudeConnection(workspaceId: string | null, enabled: boolean) {
  const connected = useConnectedApps(enabled && Boolean(workspaceId));

  const connections = useMemo(
    () => connected.apps.filter((app) => app.workspaceId === workspaceId),
    [connected.apps, workspaceId],
  );
  const tile = useMemo(() => toTile(connections), [connections]);
  const entry = useMemo<Searchable>(
    () => ({ name: tile.name, description: tile.description, group: CATEGORY_TITLE.ai, state: tileState(tile) }),
    [tile],
  );

  const disconnect = (app: ConnectedApp) => {
    confirmDelete({
      title: `Disconnect ${app.clientName}?`,
      body: `${app.clientName} stops reading this workspace immediately${
        app.lastUsedAt ? ` (last used ${timeAgo(app.lastUsedAt)})` : ""
      }. You can connect it again at any time.`,
      confirmLabel: "Disconnect",
      confirmColor: "red",
      onConfirm: () => connected.revoke(app.id),
    });
  };

  return {
    tile,
    entry,
    connections,
    mcpUrl: connected.mcpUrl,
    available: enabled && connected.available,
    loading: enabled && connected.loading,
    revokingId: connected.revokingId,
    refresh: connected.reload,
    disconnect,
  };
}
