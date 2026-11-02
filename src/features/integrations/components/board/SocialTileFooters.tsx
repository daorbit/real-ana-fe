import { useLinkedInConnect } from "@/features/analytics/hooks/useLinkedInConnect";
import { useInstagramConnect } from "@/features/social/hooks/useInstagramConnect";
import { ConnectionFooter, type ConnectionFooterProps } from "../ConnectionFooter";

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
    return { tone: "idle", label: "Checking connection", action: "Connect", variant: "light", disabled: true, onAction: c.connect };
  }
  if (c.status?.configured === false) {
    return { tone: "idle", label: "Not set up on this server yet", action: "Connect", variant: "light", disabled: true, onAction: c.connect };
  }
  if (c.needsPostingPermission || c.needsReconnect) {
    return {
      tone: "warn",
      label: c.needsPostingPermission ? "Posting not allowed yet" : "Access expired",
      action: c.needsPostingPermission ? "Allow posting" : "Reconnect",
      variant: "light",
      color: "orange",
      busy: c.connecting,
      onAction: c.connect,
    };
  }
  if (c.status?.connected) {
    return {
      tone: "ok",
      label: account ? `Connected as ${account}` : "Connected",
      action: "Disconnect",
      variant: "default",
      busy: c.disconnecting,
      onAction: c.disconnect,
    };
  }
  return { tone: "idle", label: "Not connected", action: "Connect", variant: "light", busy: c.connecting, onAction: c.connect };
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
