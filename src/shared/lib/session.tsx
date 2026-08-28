import { modals } from "@mantine/modals";
import { Button, Stack, Text } from "@mantine/core";
import { clearToken, getToken, isImpersonating } from "./http";
import { navigateTo } from "@/app/navigation";

/**
 * One place that decides what happens when the server rejects a token.
 *
 * A 401 mid-session means the token lapsed or was revoked. Without this, the
 * only signal was a failed request and a generic red toast, leaving the reader
 * on a page that no longer loads. Here it becomes a single explained prompt
 * that carries them back to sign-in and remembers where they were.
 *
 * Guarded so a burst of parallel requests all 401-ing raises exactly one
 * dialog, not one per request.
 */
const RETURN_KEY = "quantalog_return_to";

let handling = false;

export function handleSessionExpired() {
  // No token means this is an ordinary unauthenticated call (login page,
  // public dashboard) — not an expiry. Impersonation exits are handled by
  // their own flow and must not trip this.
  if (handling || !getToken() || isImpersonating()) return;
  handling = true;

  try {
    const here = window.location.pathname + window.location.search;
    if (here.startsWith("/app")) sessionStorage.setItem(RETURN_KEY, here);
  } catch {
    /* private mode — losing the return path is acceptable */
  }

  clearToken();

  modals.open({
    modalId: "session-expired",
    centered: true,
    radius: "lg",
    size: "sm",
    withCloseButton: false,
    closeOnClickOutside: false,
    closeOnEscape: false,
    children: (
      <Stack gap="sm" py="sm">
        <Text fw={650} size="lg" ta="center">
          Your session has ended
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          You've been signed out for security. Sign back in and we'll return you
          to where you were.
        </Text>
        <Button
          mt="xs"
          fullWidth
          onClick={() => {
            modals.close("session-expired");
            handling = false;
            navigateTo("/login");
          }}
        >
          Sign in
        </Button>
      </Stack>
    ),
  });
}

/** The path to send someone back to after they re-authenticate, if any. */
export function consumeReturnPath(): string | null {
  try {
    const to = sessionStorage.getItem(RETURN_KEY);
    if (to) sessionStorage.removeItem(RETURN_KEY);
    return to;
  } catch {
    return null;
  }
}
