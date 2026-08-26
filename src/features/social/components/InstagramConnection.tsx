import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Anchor, Box, Button, Group, Loader, Text } from "@mantine/core";
import { Check } from "lucide-react";
import { notify, errMessage } from "@/shared/lib/notify";
import { getToken } from "@/shared/lib/http";
import {
  useGetInstagramStatusQuery,
  useDisconnectInstagramMutation,
} from "@/app/store";
import { INSTAGRAM_PINK, InstagramMark } from "@/shared/ui/LinkedInMark";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";

/** The API origin the OAuth redirect has to leave from. Same base RTK Query uses. */
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * The reasons the server reports, in words.
 *
 * Kept in step with `REASON_TEXT` in the Instagram route, which renders the same
 * wording inside the popup — both are needed, and they are read in different
 * places: the popup by someone watching it, this toast by someone whose
 * attention had already gone back to the app.
 */
const REASON_TEXT: Record<string, string> = {
  not_signed_in: "Your session could not be verified. Sign in again, then retry connecting Instagram.",
  not_configured:
    "Instagram is not set up on this deployment yet. Ask an administrator to add the credentials.",
  demo: "Instagram cannot be connected from a demo session.",
  invalid_state: "That connection attempt expired. Please try again.",
  missing_code: "Instagram did not return an authorisation code. Please try again.",
  instagram_failed: "Instagram could not complete the connection. Please try again.",
  save_failed: "The connection could not be saved. Please try again.",
  no_publish: "Posting permission was not granted. Reconnect and allow publishing to continue.",
  already_connected: "That Instagram account is already connected to a different Quantalog account.",
  not_professional:
    "Only Instagram Business or Creator accounts can be connected. Switch your account type in the Instagram app, then try again.",
};

/**
 * Begin the OAuth flow in a popup.
 *
 * A separate window rather than a full-page navigation, for the same reason as
 * the LinkedIn card: the page someone was on should still be there when they
 * come back, with anything typed into it intact.
 *
 * It has to be a real navigation of *some* window rather than a fetch, since the
 * endpoint answers with a redirect to instagram.com and the consent screen must
 * render in an address bar. That is also why the app's own token rides in the
 * query string — a navigation cannot carry an `Authorization` header. The server
 * verifies it, mints the signed state, and redirects away immediately.
 */
function startInstagramConnect(): Window | null {
  const token = getToken() ?? "";
  const url = `${API_BASE}/api/auth/instagram?token=${encodeURIComponent(token)}`;
  const popup = window.open(url, "instagram-oauth", "width=600,height=720,menubar=no,toolbar=no");
  // A blocked popup falls back to a full navigation, so a blocker makes the flow
  // clumsy rather than broken.
  if (!popup) window.location.href = url;
  return popup;
}

/**
 * The Instagram connection strip, shown inside the Settings connections card.
 *
 * Deliberately the same shape as `LinkedInConnection`: a connected account
 * collapses to one quiet line naming it, and everything else is the work of
 * getting connected.
 */
export function InstagramConnection() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { data: status, isLoading, refetch } = useGetInstagramStatusQuery();
  const [disconnect, { isLoading: disconnecting }] = useDisconnectInstagramMutation();
  // True between opening the popup and hearing back from it, so the button can
  // show that something is in flight in another window.
  const [connecting, setConnecting] = useState(false);

  // The popup reports its outcome here and closes itself.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Same-origin only, and only our own message shape: any page holding a
      // handle on this window can post to it.
      if (e.origin !== window.location.origin) return;
      if (e.data?.source !== "quantalog-instagram") return;

      setConnecting(false);
      if (e.data.status === "connected") {
        notify.success(t("settings.instagramConnected", "Instagram connected"));
        refetch();
      } else if (e.data.status === "cancelled") {
        notify.info(t("settings.instagramCancelled", "Instagram connection cancelled"));
      } else {
        // The server names the cause, and most of these need a different action
        // rather than another attempt — switching account type, signing in
        // again, or an admin adding credentials.
        notify.error(
          REASON_TEXT[e.data.reason]
            ?? t("settings.instagramError", "Could not connect Instagram. Please try again."),
        );
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [t, refetch]);

  // Expired, or connected without the publishing grant: both need another trip
  // through consent before anything can be published.
  const needsReconnect = Boolean(
    status?.connected && (status.expired || status.canPublish === false),
  );
  const needsPostingPermission = Boolean(
    status?.connected && !status.expired && status.canPublish === false,
  );

  const runDisconnect = async () => {
    trace(user?.id, "disconnect_instagram", "settings", "instagram_disconnected");
    try {
      await disconnect().unwrap();
      notify.success(t("settings.instagramDisconnected", "Instagram disconnected"));
    } catch (e) {
      notify.error(
        errMessage(e, t("settings.instagramDisconnectError", "Could not disconnect Instagram.")),
      );
    }
  };

  if (isLoading) {
    return (
      <Group gap={8} mt="md">
        <Loader size="xs" />
        <Text size="sm" c="dimmed">Instagram</Text>
      </Group>
    );
  }

  // A working connection is not news, so it stops being a form: one line naming
  // the account posts will go out as, with disconnect as a text link.
  if (status?.connected && !needsReconnect) {
    return (
      <Group gap={8} mt="md" wrap="nowrap">
        <Check size={14} style={{ color: "var(--mantine-color-teal-6)", flexShrink: 0 }} />
        <Text size="xs" c="dimmed" truncate>
          {t("settings.instagramConnectedAs", "Connected as @{{name}}", {
            name: status.profile?.username ?? "",
          })}
        </Text>
        <Anchor
          component="button"
          type="button"
          size="xs"
          c="dimmed"
          underline="always"
          disabled={disconnecting}
          onClick={runDisconnect}
          style={{ flexShrink: 0 }}
        >
          {t("settings.instagramDisconnect", "Disconnect")}
        </Anchor>
      </Group>
    );
  }

  return (
    <Box mt="md">
      <Text size="xs" c="dimmed" mb={10}>
        {status?.configured === false
          ? t(
              "settings.instagramNotConfigured",
              "Instagram is not set up on this deployment yet.",
            )
          : needsPostingPermission
            ? t(
                "settings.instagramNeedsPosting",
                "Connected, but publishing was not allowed. Reconnect to grant it.",
              )
            : needsReconnect
              ? t(
                  "settings.instagramExpired",
                  "Your Instagram connection has expired. Reconnect to keep publishing.",
                )
              : t(
                  "settings.instagramConnectHint",
                  "Connect an Instagram Business or Creator account to publish scheduled posts.",
                )}
      </Text>

      {/* Said before the consent screen rather than after it: someone reading
          Meta's permission wording cold deserves to already know what this app
          does with it. Only shown while the decision is still ahead of them. */}
      {status?.configured !== false && !needsReconnect && (
        <Text size="xs" c="dimmed" mb={10} style={{ lineHeight: 1.5 }}>
          {t(
            "settings.instagramScopeNote",
            "Quantalog only reads your username and publishes the posts you schedule here. It cannot read your messages, comments, or followers.",
          )}
        </Text>
      )}

      <Button
        size="sm"
        // Offering the button with no server credentials would only bounce the
        // user back with an error.
        disabled={status?.configured === false}
        loading={connecting}
        onClick={() => {
          trace(user?.id, "connect_instagram", "settings", "instagram_oauth_popup");
          setConnecting(true);
          const popup = startInstagramConnect();
          // A blocked popup became a full navigation; nothing left to wait for.
          if (!popup) return setConnecting(false);

          // The window can also be closed by hand, which sends no message at
          // all. Without this the button would spin for ever.
          const timer = window.setInterval(() => {
            if (!popup.closed) return;
            window.clearInterval(timer);
            setConnecting(false);
            // It may have closed *because* it succeeded, a moment before its
            // message arrived; re-reading the status settles which.
            refetch();
          }, 700);
        }}
        leftSection={<InstagramMark size={15} color="#fff" />}
        style={
          status?.configured === false
            ? undefined
            : { background: INSTAGRAM_PINK, color: "#fff" }
        }
      >
        {needsPostingPermission
          ? t("settings.instagramEnablePosting", "Enable posting")
          : needsReconnect
            ? t("settings.instagramReconnect", "Reconnect Instagram")
            : t("settings.instagramConnect", "Connect Instagram")}
      </Button>
    </Box>
  );
}
