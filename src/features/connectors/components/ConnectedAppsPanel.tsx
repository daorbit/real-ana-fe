import { Button, Loader } from "@mantine/core";
import { Bot } from "lucide-react";
import { SecurityGroup, SecurityRow } from "@/features/auth/components/settings/SecurityGroup";
import { useConnectedApps } from "@/features/connectors/hooks/useConnectedApps";
import type { ConnectedApp } from "@/features/connectors/lib/connectorApi";
import { timeAgo } from "@/shared/lib/format";
import { confirmDelete } from "@/shared/lib/notify";
import classes from "@/features/auth/components/settings/Security.module.css";

function describe(app: ConnectedApp): string {
  return [
    app.workspaceName || "Workspace",
    app.lastUsedAt ? `Used ${timeAgo(app.lastUsedAt)}` : `Connected ${timeAgo(app.connectedAt)}`,
    "Read-only",
  ].join(" · ");
}

export function ConnectedAppsPanel() {
  const { apps, loading, available, revokingId, revoke } = useConnectedApps();
  if (!available) return null;

  const confirmRevoke = (app: ConnectedApp) => {
    confirmDelete({
      title: `Disconnect ${app.clientName}?`,
      body: `${app.clientName} will immediately lose access to ${app.workspaceName || "this workspace"}. You can connect it again at any time.`,
      confirmLabel: "Disconnect",
      confirmColor: "red",
      onConfirm: () => revoke(app.id),
    });
  };

  return (
    <SecurityGroup
      label={loading ? "Connected AI apps" : `Connected AI apps · ${apps.length}`}
      footer="Apps like Claude that you've allowed to read a workspace. Disconnect any you no longer use."
    >
      {loading ? (
        <div className={classes.loading}>
          <Loader size="sm" />
        </div>
      ) : apps.length === 0 ? (
        <p className={classes.empty}>No AI apps are connected.</p>
      ) : (
        apps.map((app) => (
          <SecurityRow
            key={app.id}
            icon={Bot}
            hue="violet"
            title={app.clientName}
            description={describe(app)}
            action={
              <Button
                variant="subtle"
                color="red"
                size="xs"
                radius="xl"
                loading={revokingId === app.id}
                onClick={() => confirmRevoke(app)}
              >
                Disconnect
              </Button>
            }
          />
        ))
      )}
    </SecurityGroup>
  );
}
