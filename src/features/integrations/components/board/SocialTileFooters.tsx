import { Check, CircleDashed, Link2, RefreshCw, TriangleAlert, Unlink } from "lucide-react";
import { useLinkedInConnect } from "@/features/analytics/hooks/useLinkedInConnect";
import { useInstagramConnect } from "@/features/social/hooks/useInstagramConnect";
import { ConnectionFooter, footerIconClass, type ConnectionFooterProps } from "../ConnectionFooter";

type SocialConnection = {
  status?: { configured?: boolean; connected?: boolean };
  isLoading: boolean;
  connecting: boolean;
  disconnecting: boolean;
  needsReconnect: boolean;
  needsPostingPermission: boolean;
  connect: () => void;
  disconnect: () => void;
};

type FooterView = Omit<ConnectionFooterProps, "ariaLabel" | "celebrate">;

function footerView(c: SocialConnection, account: string): FooterView {
  if (c.isLoading) {
    return {
      icon: <CircleDashed size={14} className={footerIconClass.idle} />,
      label: "Checking connection",
      action: "Connect",
      actionIcon: <Link2 size={14} />,
      variant: "light",
      disabled: true,
      onAction: c.connect,
    };
  }
  if (c.status?.configured === false) {
    return {
      icon: <CircleDashed size={14} className={footerIconClass.idle} />,
      label: "Not set up on this server yet",
      action: "Connect",
      actionIcon: <Link2 size={14} />,
      variant: "light",
      disabled: true,
      onAction: c.connect,
    };
  }
  if (c.needsPostingPermission || c.needsReconnect) {
    return {
      icon: <TriangleAlert size={14} className={footerIconClass.warn} />,
      label: c.needsPostingPermission ? "Posting not allowed yet" : "Access expired",
      action: c.needsPostingPermission ? "Allow posting" : "Reconnect",
      actionIcon: <RefreshCw size={14} />,
      variant: "light",
      color: "orange",
      busy: c.connecting,
      onAction: c.connect,
    };
  }
  if (c.status?.connected) {
    return {
      icon: <Check size={14} className={footerIconClass.ok} />,
      label: account ? `Connected as ${account}` : "Connected",
      action: "Disconnect",
      actionIcon: <Unlink size={14} />,
      variant: "default",
      busy: c.disconnecting,
      onAction: c.disconnect,
    };
  }
  return {
    icon: <CircleDashed size={14} className={footerIconClass.idle} />,
    label: "Not connected",
    action: "Connect",
    actionIcon: <Link2 size={14} />,
    variant: "light",
    busy: c.connecting,
    onAction: c.connect,
  };
}

interface FooterProps {
  celebrate: boolean;
  onConnected: () => void;
}

export function LinkedInTileFooter({ celebrate, onConnected }: FooterProps) {
  const connection = useLinkedInConnect({ onConnected, source: "apps" });
  const view = footerView(connection, connection.status?.profile?.name ?? "");
  return <ConnectionFooter {...view} celebrate={celebrate} ariaLabel={`${view.action} LinkedIn`} />;
}

export function InstagramTileFooter({ celebrate, onConnected }: FooterProps) {
  const connection = useInstagramConnect({ onConnected, source: "apps" });
  const username = connection.status?.profile?.username;
  const view = footerView(connection, username ? `@${username}` : "");
  return <ConnectionFooter {...view} celebrate={celebrate} ariaLabel={`${view.action} Instagram`} />;
}
