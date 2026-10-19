import { api } from "@/shared/lib/http";
import type { WorkspaceRole } from "@/shared/types";

export type ConnectorScope = { scope: string; description: string };

export type AuthorizationRequest = {
  client: { name: string; redirectHost: string };
  scopes: ConnectorScope[];
  workspaces: { id: string; name: string; role: WorkspaceRole }[];
  expiresAt: string;
};

export type ConnectedApp = {
  id: string;
  clientName: string;
  workspaceId: string;
  workspaceName: string;
  scopes: ConnectorScope[];
  connectedAt: string;
  lastUsedAt: string | null;
};

const base = "/api/oauth";

export const connectorApi = {
  describe: (requestId: string) =>
    api.get<AuthorizationRequest>(`${base}/requests/${encodeURIComponent(requestId)}`),
  approve: (requestId: string, workspaceId: string) =>
    api.post<{ redirectUrl: string }>(`${base}/requests/${encodeURIComponent(requestId)}/approve`, { workspaceId }),
  deny: (requestId: string) =>
    api.post<{ redirectUrl: string }>(`${base}/requests/${encodeURIComponent(requestId)}/deny`, {}),
  listApps: () => api.get<{ items: ConnectedApp[]; mcpUrl: string }>(`${base}/grants`),
  revokeApp: (grantId: string) => api.del(`${base}/grants/${encodeURIComponent(grantId)}`),
};
