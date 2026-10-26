import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { notify, errMessage } from "@/shared/lib/notify";
import { useAuth } from "@/features/auth/context";
import { useWorkspace } from "@/features/workspace/context";
import { socialConnectUrl } from "@/features/social/lib/socialConnectUrl";
import { useGetInstagramStatusQuery, useDisconnectInstagramMutation } from "@/app/store";

const POPUP_POLL_MS = 700;

const REASON_TEXT: Record<string, string> = {
  not_signed_in: "Your session could not be verified. Sign in again, then retry connecting Instagram.",
  not_configured: "Instagram is not set up on this deployment yet. Ask an administrator to add the credentials.",
  demo: "Instagram cannot be connected from a demo session.",
  invalid_state: "That connection attempt expired. Please try again.",
  missing_code: "Instagram did not return an authorisation code. Please try again.",
  instagram_failed: "Instagram could not complete the connection. Please try again.",
  save_failed: "The connection could not be saved. Please try again.",
  no_publish: "Posting permission was not granted. Reconnect and allow publishing to continue.",
  already_connected: "That Instagram account is already connected to a different Quantalog workspace.",
  no_workspace: "You need editor access to this workspace to connect Instagram.",
  not_professional:
    "Only Instagram Business or Creator accounts can be connected. Switch your account type in the Instagram app, then try again.",
};

function openInstagramPopup(workspaceId: string): Window | null {
  const url = socialConnectUrl("instagram", workspaceId);
  const popup = window.open(url, "instagram-oauth", "width=600,height=720,menubar=no,toolbar=no");
  if (!popup) window.location.href = url;
  return popup;
}

export function useInstagramConnect({ onConnected, source = "settings" }: { onConnected?: () => void; source?: string } = {}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { active } = useWorkspace();
  const workspaceId = active?._id ?? "";
  const { data: status, isLoading, refetch } = useGetInstagramStatusQuery(workspaceId, { skip: !workspaceId });
  const [disconnectMutation, { isLoading: disconnecting }] = useDisconnectInstagramMutation();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.source !== "quantalog-instagram") return;
      setConnecting(false);
      if (e.data.status === "connected") {
        notify.success(t("settings.instagramConnected", "Instagram connected"));
        refetch();
        onConnected?.();
      } else if (e.data.status === "cancelled") {
        notify.info(t("settings.instagramCancelled", "Instagram connection cancelled"));
      } else {
        notify.error(
          REASON_TEXT[e.data.reason] ?? t("settings.instagramError", "Could not connect Instagram. Please try again."),
        );
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [t, refetch, onConnected]);

  const needsReconnect = Boolean(status?.connected && (status.expired || status.canPublish === false));
  const needsPostingPermission = Boolean(status?.connected && !status.expired && status.canPublish === false);

  const connect = useCallback(() => {
    setConnecting(true);
    const popup = openInstagramPopup(workspaceId);
    if (!popup) return setConnecting(false);
    const timer = window.setInterval(() => {
      if (!popup.closed) return;
      window.clearInterval(timer);
      setConnecting(false);
      refetch();
    }, POPUP_POLL_MS);
  }, [user?.id, source, refetch, workspaceId]);

  const disconnect = useCallback(async () => {
    try {
      await disconnectMutation(workspaceId).unwrap();
      notify.success(t("settings.instagramDisconnected", "Instagram disconnected"));
    } catch (e) {
      notify.error(errMessage(e, t("settings.instagramDisconnectError", "Could not disconnect Instagram.")));
    }
  }, [user?.id, source, disconnectMutation, t, workspaceId]);

  return { status, isLoading, connecting, disconnecting, needsReconnect, needsPostingPermission, connect, disconnect };
}

export type InstagramConnect = ReturnType<typeof useInstagramConnect>;
