import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { notify, errMessage } from "@/shared/lib/notify";
import { getToken } from "@/shared/lib/http";
import { useAuth } from "@/features/auth/context";
import { useGetLinkedInStatusQuery, useDisconnectLinkedInMutation } from "@/app/store";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";
const POPUP_POLL_MS = 700;

function openLinkedInPopup(): Window | null {
  const token = getToken() ?? "";
  const url = `${API_BASE}/api/auth/linkedin?token=${encodeURIComponent(token)}`;
  const popup = window.open(url, "linkedin-oauth", "width=600,height=720,menubar=no,toolbar=no");
  if (!popup) window.location.href = url;
  return popup;
}

export function useLinkedInConnect({ onConnected, source = "share_composer" }: { onConnected?: () => void; source?: string } = {}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: status, isLoading, refetch } = useGetLinkedInStatusQuery();
  const [disconnectMutation, { isLoading: disconnecting }] = useDisconnectLinkedInMutation();
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      if (e.data?.source !== "quantalog-linkedin") return;
      setConnecting(false);
      if (e.data.status === "connected") {
        notify.success(t("sharePost.linkedinConnected"));
        refetch();
        onConnected?.();
      } else if (e.data.status === "cancelled") {
        notify.info(t("sharePost.linkedinConnectCancelled"));
      } else {
        notify.error(t("sharePost.linkedinConnectError"));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [t, refetch, onConnected]);

  const needsReconnect = Boolean(status?.connected && (status.expired || status.canPublish === false));
  const needsPostingPermission = Boolean(status?.connected && !status.expired && status.canPublish === false);

  const connect = useCallback(() => {
    setConnecting(true);
    const popup = openLinkedInPopup();
    if (!popup) return setConnecting(false);
    const timer = window.setInterval(() => {
      if (!popup.closed) return;
      window.clearInterval(timer);
      setConnecting(false);
      refetch();
    }, POPUP_POLL_MS);
  }, [user?.id, source, refetch]);

  const disconnect = useCallback(async () => {
    try {
      await disconnectMutation().unwrap();
      notify.success(t("sharePost.linkedinDisconnected"));
    } catch (e) {
      notify.error(errMessage(e, t("sharePost.linkedinDisconnectError")));
    }
  }, [user?.id, source, disconnectMutation, t]);

  return { status, isLoading, connecting, disconnecting, needsReconnect, needsPostingPermission, connect, disconnect };
}

export type LinkedInConnect = ReturnType<typeof useLinkedInConnect>;
