import type { ReactNode } from "react";
import { Skeleton } from "@mantine/core";
import {
  useDisconnectSearchConsoleMutation,
  useGetSearchConsoleStatusQuery,
  useUnlinkSearchConsolePropertyMutation,
} from "@/app/store";
import { useActiveBilling, usePermissions } from "@/features/workspace/context";
import { confirmDelete, errMessage, notify } from "@/shared/lib/notify";
import { SearchConsoleConnectCard } from "./SearchConsoleConnectCard";
import { SearchConsolePropertyPicker } from "./SearchConsolePropertyPicker";
import { useSearchConsoleConnect } from "../useSearchConsoleConnect";

export type SearchConsoleLink = {
  propertyUrl: string;
  googleEmail: string;
  onChangeProperty?: () => void;
  onDisconnect?: () => void;
};

export function SearchConsoleGate({
  workspaceId,
  siteId,
  children,
}: {
  workspaceId: string;
  siteId: string;
  children: (link: SearchConsoleLink) => ReactNode;
}) {
  const { canAdmin } = usePermissions();
  const billing = useActiveBilling();
  const onFreePlan = billing?.plan?.slug === "free";

  const { data: status, isLoading, refetch } = useGetSearchConsoleStatusQuery(workspaceId, {
    skip: !workspaceId,
  });
  const { connect, connecting } = useSearchConsoleConnect(workspaceId, () => void refetch());
  const [unlink] = useUnlinkSearchConsolePropertyMutation();
  const [disconnect] = useDisconnectSearchConsoleMutation();

  if (isLoading) return <Skeleton height={260} radius="md" />;
  if (!status) return null;

  if (onFreePlan) return <SearchConsoleConnectCard variant="upgrade" />;
  if (!status.configured) return <SearchConsoleConnectCard variant="not-configured" />;

  if (!status.connected || !status.connection) {
    return canAdmin ? (
      <SearchConsoleConnectCard variant="connect" onConnect={connect} connecting={connecting} />
    ) : (
      <SearchConsoleConnectCard variant="ask-admin" />
    );
  }

  if (status.connection.status !== "active") {
    return canAdmin ? (
      <SearchConsoleConnectCard
        variant="reconnect"
        message={status.connection.statusMessage}
        onConnect={connect}
        connecting={connecting}
      />
    ) : (
      <SearchConsoleConnectCard variant="ask-admin" message={status.connection.statusMessage} />
    );
  }

  const link = status.links.find((l) => l.siteId === siteId);

  if (!link) {
    return canAdmin ? (
      <SearchConsolePropertyPicker
        workspaceId={workspaceId}
        siteId={siteId}
        googleEmail={status.connection.googleEmail}
        onSwitchAccount={connect}
        switching={connecting}
      />
    ) : (
      <SearchConsoleConnectCard
        variant="ask-admin"
        message="Search visibility is connected, but no property is linked to this site yet. A workspace admin can link one."
      />
    );
  }

  const changeProperty = async () => {
    try {
      await unlink({ workspaceId, siteId }).unwrap();
    } catch (e) {
      notify.error(errMessage(e, "Could not change the property."));
    }
  };

  const disconnectAll = () =>
    confirmDelete({
      title: "Disconnect Search visibility?",
      body: "Quantalog will stop reading search data for every site in this workspace, and the saved Search visibility data is deleted. You can reconnect at any time.",
      confirmLabel: "Disconnect",
      onConfirm: async () => {
        try {
          await disconnect(workspaceId).unwrap();
          notify.success("Search visibility disconnected");
        } catch (e) {
          notify.error(errMessage(e, "Could not disconnect Search visibility."));
        }
      },
    });

  return (
    <>
      {children({
        propertyUrl: link.propertyUrl,
        googleEmail: status.connection.googleEmail,
        onChangeProperty: canAdmin ? () => void changeProperty() : undefined,
        onDisconnect: canAdmin ? disconnectAll : undefined,
      })}
    </>
  );
}
