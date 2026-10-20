import { useMemo } from "react";
import { useConnectedApps } from "@/features/connectors/hooks/useConnectedApps";
import type { ConnectedApp } from "@/features/connectors/lib/connectorApi";
import { confirmDelete } from "@/shared/lib/notify";
import { AI_ASSISTANTS, assistantForApp, workspaceMcpUrl, type AssistantInfo } from "../lib/aiAssistants";
import { CATEGORY_TITLE } from "../lib/catalog";
import { tileState, type Searchable } from "../lib/filter";
import type { IntegrationTile } from "../types";

export interface AssistantItem {
  info: AssistantInfo;
  tile: IntegrationTile;
  entry: Searchable;
  connections: ConnectedApp[];
  elsewhere: ConnectedApp[];
  mcpUrl: string;
}

function workspaceNames(apps: ConnectedApp[]): string {
  return [...new Set(apps.map((app) => app.workspaceName || "another workspace"))].join(", ");
}

function accountLabel(connections: ConnectedApp[], elsewhere: ConnectedApp[]): string | undefined {
  if (connections.length) return `Connected to ${workspaceNames(connections)}`;
  if (elsewhere.length) return `Connected to ${workspaceNames(elsewhere)} only`;
  return undefined;
}

function toTile(info: AssistantInfo, connections: ConnectedApp[], elsewhere: ConnectedApp[]): IntegrationTile {
  const count = connections.length;
  return {
    kind: "ai-assistant",
    id: info.id,
    name: info.name,
    category: "ai",
    description: info.description,
    connected: count > 0,
    enabled: count > 0,
    account: accountLabel(connections, elsewhere),
    lastUsedAt: connections
      .map((c) => c.lastUsedAt ?? c.connectedAt)
      .sort()
      .at(-1),
  };
}

export function useAiAssistants(workspaceId: string | null, enabled: boolean) {
  const connected = useConnectedApps(enabled && Boolean(workspaceId));

  const items = useMemo<AssistantItem[]>(() => {
    return AI_ASSISTANTS.map((info) => {
      const mine = connected.apps.filter((app) => assistantForApp(app)?.id === info.id);
      const connections = mine.filter((app) => app.workspaceId === workspaceId);
      const elsewhere = mine.filter((app) => app.workspaceId !== workspaceId);
      const tile = toTile(info, connections, elsewhere);
      return {
        info,
        tile,
        connections,
        elsewhere,
        mcpUrl: workspaceMcpUrl(connected.mcpUrl, workspaceId, info.id),
        entry: { name: tile.name, description: tile.description, group: CATEGORY_TITLE.ai, state: tileState(tile) },
      };
    });
  }, [connected.apps, connected.mcpUrl, workspaceId]);

  const disconnect = (app: ConnectedApp) => {
    confirmDelete({
      title: `Disconnect ${app.clientName}?`,
      body: `${app.clientName} stops reading ${app.workspaceName || "this workspace"} immediately. You can connect it again at any time.`,
      confirmLabel: "Disconnect",
      confirmColor: "red",
      onConfirm: () => connected.revoke(app.id),
    });
  };

  return {
    items,
    available: enabled && connected.available,
    loading: enabled && connected.loading,
    revokingId: connected.revokingId,
    refresh: connected.reload,
    disconnect,
  };
}
