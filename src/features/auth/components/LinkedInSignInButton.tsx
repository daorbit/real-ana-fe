import { useEffect, useRef, useState } from "react";
import { Button } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context";
import { notify } from "@/shared/lib/notify";

/**
 * Sign in with LinkedIn.
 *
 * Unlike the Google button beside it, this is a plain redirect: LinkedIn has no
 * in-page SDK that hands back a credential, so the whole page leaves for the
 * consent screen and the server sends it back with a signed token in the query
 * string. A full navigation rather than the popup the Share Panel uses —
 * nothing is composed on the login page, so there is no unsaved work to protect,
 * and a popup would only add a blocker to fail on.
 *
 * The token in the URL is read once, adopted, and stripped from the address bar
 * immediately.
 */

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

/** LinkedIn's mark. Carried inline for the same reason as in the Share Panel. */
const LINKEDIN_PATH =
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z";

function LinkedInIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
      <path d={LINKEDIN_PATH} />
    </svg>
  );
}

export function LinkedInSignInButton({
  label = "Continue with LinkedIn",
  onError,
}: {
  label?: string;
  onError?: (message: string) => void;
}) {
  const { adoptToken } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  // Effects run twice under StrictMode in development, and adopting the same
  // token twice would fire two navigations.
  const handled = useRef(false);

  // Handle the return leg: the server redirects here with the outcome, and a
  // token when the sign-in succeeded.
  useEffect(() => {
    if (handled.current) return;

    const params = new URLSearchParams(window.location.search);
    const status = params.get("linkedinLogin");
    if (!status) return;

    handled.current = true;

    // Strip the parameters before anything async runs: the token must not
    // survive in the address bar, in history, or in a link the user might copy.
    const clean = () =>
      window.history.replaceState({}, "", window.location.pathname);

    if (status !== "ok") {
      clean();
      if (status !== "cancelled") {
        onError?.("Could not sign in with LinkedIn. Please try again.");
      }
      return;
    }

    const token = params.get("token");
    clean();
    if (!token) {
      onError?.("Could not sign in with LinkedIn. Please try again.");
      return;
    }

    setBusy(true);
    adoptToken(token)
      .then(() => {
        notify.success("Welcome back!", "Logged in");
        nav("/app");
      })
      .catch(() => onError?.("Could not sign in with LinkedIn. Please try again."))
      .finally(() => setBusy(false));
  }, [adoptToken, nav, onError]);

  return (
    <Button
      variant="default"
      size="md"
      fullWidth
      loading={busy}
      leftSection={<LinkedInIcon />}
      onClick={() => {
        setBusy(true);
        window.location.href = `${API_BASE}/api/auth/linkedin?mode=login`;
      }}
    >
      {label}
    </Button>
  );
}

export default LinkedInSignInButton;
