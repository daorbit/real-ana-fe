import { useMemo } from "react";
import { useConnectedApps } from "@/features/connectors/hooks/useConnectedApps";
import type { ConnectedApp } from "@/features/connectors/lib/connectorApi";
import { confirmDelete } from "@/shared/lib/notify";
import { AI_ASSISTANTS, assistantForHost, type AssistantInfo } from "../lib/aiAssistants";
import { CATEGORY_TITLE } from "../lib/catalog";
import { tileState, type Searchable } from "../lib/filter";
import type { IntegrationTile } from "../types";

export interface AssistantItem {
  info: AssistantInfo;
  tile: IntegrationTile;
  entry: Searchable;
  connections: ConnectedApp[];
}

function toTile(info: AssistantInfo, connections: ConnectedApp[]): IntegrationTile {
  const count = connections.length;
  return {
    kind: "ai-assistant",
    id: info.id,
    name: info.name,
    category: "ai",
    description: info.description,
    connected: count > 0,
    enabled: count > 0,
    account: count ? `${count} connection${count === 1 ? "" : "s"}` : undefined,
    lastUsedAt: connections
      .map((c) => c.lastUsedAt ?? c.connectedAt)
      .sort()
      .at(-1),
  };
}

export function useAiAssistants(workspaceId: string | null, enabled: boolean) {
  const connected = useConnectedApps(enabled && Boolean(workspaceId));

  const items = useMemo<AssistantItem[]>(() => {
    const inWorkspace = connected.apps.filter((app) => app.workspaceId === workspaceId);
    return AI_ASSISTANTS.map((info) => {
      const connections = inWorkspace.filter((app) => assistantForHost(app.clientHost)?.id === info.id);
      const tile = toTile(info, connections);
      return {
        info,
        tile,
        connections,
        entry: { name: tile.name, description: tile.description, group: CATEGORY_TITLE.ai, state: tileState(tile) },
      };
    });
  }, [connected.apps, workspaceId]);

  const disconnect = (app: ConnectedApp) => {
    confirmDelete({
      title: `Disconnect ${app.clientName}?`,
      body: `${app.clientName} stops reading this workspace immediately. You can connect it again at any time.`,
      confirmLabel: "Disconnect",
      confirmColor: "red",
      onConfirm: () => connected.revoke(app.id),
    });
  };

  return {
    items,
    mcpUrl: connected.mcpUrl,
    available: enabled && connected.available,
    loading: enabled && connected.loading,
    revokingId: connected.revokingId,
    refresh: connected.reload,
    disconnect,
  };
}
