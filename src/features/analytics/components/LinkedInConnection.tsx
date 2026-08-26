import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Anchor, Box, Button, Group, Loader, Text } from "@mantine/core";
import { Check } from "lucide-react";
import { notify, errMessage } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import { getToken } from "@/shared/lib/http";
import {
  useGetLinkedInStatusQuery,
  useDisconnectLinkedInMutation,
} from "@/app/store";
import { LINKEDIN_ICON, PlatformGlyph } from "./sharePlatforms";

/** The API origin the OAuth redirect has to leave from. Same base RTK Query uses. */
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * Begin the OAuth flow in a popup.
 *
 * A separate window rather than a full-page navigation, because this modal
 * holds unsaved work: a composed caption and a rendered card. Navigating away
 * and coming back through a redirect would discard both, which reads as the app
 * reloading and losing the post. The popup leaves this page — and everything
 * typed into it — exactly where it was.
 *
 * It has to be a real navigation of *some* window rather than a fetch, since
 * the endpoint answers with a redirect to linkedin.com and the consent screen
 * must render in an address bar. That is also why the app's own token rides in
 * the query string: a navigation cannot carry an `Authorization` header. The
 * server verifies it, mints the signed state, and redirects away immediately.
 *
 * Falls back to a full navigation if the popup is blocked, so a blocker turns
 * the flow clumsy rather than broken.
 */
function startLinkedInConnect(): Window | null {
  const token = getToken() ?? "";
  const url = `${API_BASE}/api/auth/linkedin?token=${encodeURIComponent(token)}`;
  const popup = window.open(url, "linkedin-oauth", "width=600,height=720,menubar=no,toolbar=no");
  if (!popup) window.location.href = url;
  return popup;
}

/**
 * The LinkedIn connection strip, shown only on the LinkedIn tab.
 *
 * Deliberately additive: the other four networks keep the copy-and-open
 * behaviour they have always had, and nothing here runs for them. The panel's
 * layout, components and styling are the existing ones.
 */
/**
 * The LinkedIn connection strip.
 *
 * Getting connected only — publishing lives in the panel footer, next to every
 * other action, so this component no longer holds a post button or its state.
 */
export function LinkedInConnection() {
  const { t } = useTranslation();
  const { data: status, isLoading, refetch } = useGetLinkedInStatusQuery();
  const [disconnect, { isLoading: disconnecting }] = useDisconnectLinkedInMutation();
  const { user } = useAuth();
  // True between opening the popup and hearing back from it, so the button can
  // show that something is in flight in another window.
  const [connecting, setConnecting] = useState(false);

  // The popup reports its outcome here and closes itself; see the return hook.
  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      // Same-origin only, and only our own message shape: any page can post to
      // a window it has a handle on.
      if (e.origin !== window.location.origin) return;
      if (e.data?.source !== "quantalog-linkedin") return;

      setConnecting(false);
      if (e.data.status === "connected") {
        notify.success(t("sharePost.linkedinConnected"));
        refetch();
      } else if (e.data.status === "cancelled") {
        notify.info(t("sharePost.linkedinConnectCancelled"));
      } else {
        notify.error(t("sharePost.linkedinConnectError"));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [t, refetch]);
  // A connection that exists but cannot be used reads as disconnected for the
  // purpose of the primary action: the user must go back through consent.
  // Expired, or connected for sign-in only: both need another trip through
  // consent before this panel can publish. Sign-in no longer requests the
  // publishing scope, so the second case is normal rather than a fault.
  const needsReconnect = Boolean(
    status?.connected && (status.expired || status.canPublish === false),
  );
  const needsPostingPermission = Boolean(
    status?.connected && !status.expired && status.canPublish === false,
  );

  const runDisconnect = async () => {
    trace(user?.id, "linkedin_disconnected", "share_composer", "linkedin");
    try {
      await disconnect().unwrap();
      notify.success(t("sharePost.linkedinDisconnected"));
    } catch (e) {
      notify.error(errMessage(e, t("sharePost.linkedinDisconnectError")));
    }
  };

  if (isLoading) {
    return (
      <Group gap={8} mt="md">
        <Loader size="xs" />
        <Text size="sm" c="dimmed">LinkedIn</Text>
      </Group>
    );
  }

  /**
   * A working connection is not news, so it stops being a card.
   *
   * The bordered panel exists to get someone *connected*; once they are, it was
   * repeating what the tab already says and holding a second primary button a
   * few hundred pixels above the footer's. What remains is one quiet line
   * naming the account the post will go out as — the one fact that still
   * matters at the moment of publishing — with disconnect as a text link.
   * Publishing itself moved to the footer, beside every other panel's action.
   */
  if (status?.connected && !needsReconnect) {
    return (
      <Group gap={8} mt="md" wrap="nowrap">
        <Check size={14} style={{ color: "var(--mantine-color-teal-6)", flexShrink: 0 }} />
        <Text size="xs" c="dimmed" truncate>
          {t("sharePost.linkedinConnectedAs", { name: status.profile?.name ?? "" })}
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
          {t("sharePost.linkedinDisconnect")}
        </Anchor>
      </Group>
    );
  }

  return (
    <Box
      mt="md"
      p="sm"
      style={{
        border: "1px solid var(--mantine-color-default-border)",
        borderRadius: "var(--mantine-radius-md)",
      }}
    >
      <Group gap={8} mb={8} wrap="nowrap">
        <Box style={{ color: `#${LINKEDIN_ICON.hex}`, display: "flex" }}>
          <PlatformGlyph icon={LINKEDIN_ICON} size={15} />
        </Box>
        <Text size="sm" fw={600}>LinkedIn</Text>
      </Group>

      {(
        <>
          <Text size="xs" c="dimmed" mb={10}>
            {status?.configured === false
              ? t("sharePost.linkedinNotConfigured")
              : needsPostingPermission
                ? t("sharePost.linkedinNeedsPosting")
                : needsReconnect
                  ? t("sharePost.linkedinExpired")
                  : t("sharePost.linkedinConnectHint")}
          </Text>

          {/* Said before the consent screen, not after it.
              LinkedIn describes `w_member_social` as create/modify/delete —
              the full reach of the only permission it offers for publishing,
              not what this app does with it. Someone who reads that wording
              cold is right to hesitate, so what we actually do is stated here
              first, while they can still decide. */}
          {status?.configured !== false && !needsReconnect && (
            <Text size="xs" c="dimmed" mb={10} style={{ lineHeight: 1.5 }}>
              {t("sharePost.linkedinScopeNote")}
            </Text>
          )}
          <Button
            size="sm"
            // Offering the button when the server has no credentials would only
            // bounce the user back with an error.
            disabled={status?.configured === false}
            loading={connecting}
            onClick={() => {
              trace(user?.id, "linkedin_connect_started", "share_composer", "linkedin_oauth");
              setConnecting(true);
              const popup = startLinkedInConnect();
              // A blocked popup falls back to a full navigation, so there is
              // nothing left to wait for in this window.
              if (!popup) return setConnecting(false);

              // Someone can also close the window by hand, which sends no
              // message at all. Without this the button would spin forever.
              const timer = window.setInterval(() => {
                if (!popup.closed) return;
                window.clearInterval(timer);
                setConnecting(false);
                // It may have closed *because* it succeeded, a moment before
                // its message arrived; re-reading the status settles which.
                refetch();
              }, 700);
            }}
            leftSection={<PlatformGlyph icon={LINKEDIN_ICON} />}
            style={
              status?.configured === false
                ? undefined
                : { background: `#${LINKEDIN_ICON.hex}`, color: "#fff" }
            }
          >
            {needsPostingPermission
              ? t("sharePost.linkedinEnablePosting")
              : needsReconnect
                ? t("sharePost.linkedinReconnect")
                : t("sharePost.linkedinConnect")}
          </Button>
        </>
      )}
    </Box>
  );
}
