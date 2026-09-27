import type { ReactNode } from "react";
import {
  useDisconnectSearchConsoleMutation,
  useGetSearchConsoleStatusQuery,
  useUnlinkSearchConsolePropertyMutation,
} from "@/app/store";
import { usePermissions } from "@/features/workspace/context";
import { confirmDelete, errMessage, notify } from "@/shared/lib/notify";
import { SearchConsoleConnectCard } from "./SearchConsoleConnectCard";
import { SearchConsolePropertyPicker } from "./SearchConsolePropertyPicker";
import { ConsoleSkeleton } from "./SearchSkeletons";
import { OAuthWaitingModal } from "@/shared/ui/OAuthWaitingModal";
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

  const { data: status, isLoading, refetch } = useGetSearchConsoleStatusQuery(workspaceId, {
    skip: !workspaceId,
  });
  const { connect, connecting, focus, cancel } = useSearchConsoleConnect(workspaceId, () => void refetch());
  const [unlink] = useUnlinkSearchConsolePropertyMutation();
  const [disconnect] = useDisconnectSearchConsoleMutation();

  const waiting = (
    <OAuthWaitingModal
      opened={connecting}
      onFocus={focus}
      onCancel={cancel}
      description="Choose your Google account, then tick “View Search Console data for your verified sites” before pressing Continue."
    />
  );

  if (isLoading) return <ConsoleSkeleton />;
  if (!status) return null;

  if (!status.configured) return <SearchConsoleConnectCard variant="not-configured" />;

  if (!status.connected || !status.connection) {
    return canAdmin ? (
      <>
        <SearchConsoleConnectCard variant="connect" onConnect={connect} connecting={connecting} />
        {waiting}
      </>
    ) : (
      <SearchConsoleConnectCard variant="ask-admin" />
    );
  }

  if (status.connection.status !== "active") {
    return canAdmin ? (
      <>
        <SearchConsoleConnectCard
          variant="reconnect"
          message={status.connection.statusMessage}
          onConnect={connect}
          connecting={connecting}
        />
        {waiting}
      </>
    ) : (
      <SearchConsoleConnectCard variant="ask-admin" message={status.connection.statusMessage} />
    );
  }

  const link = status.links.find((l) => l.siteId === siteId);

  if (!link) {
    return canAdmin ? (
      <>
        <SearchConsolePropertyPicker
          workspaceId={workspaceId}
          siteId={siteId}
          googleEmail={status.connection.googleEmail}
          onSwitchAccount={connect}
          switching={connecting}
        />
        {waiting}
      </>
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
