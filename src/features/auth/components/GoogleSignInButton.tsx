import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button } from "@mantine/core";
import { useAuth } from "@/features/auth/context";

/**
 * Google Identity Services sign-in, wearing our own button.
 *
 * GIS only issues a credential to a button it rendered itself, and that button
 * comes with Google's fixed white-or-dark styling, which sits badly beside the
 * rest of an auth form. So the real button is rendered at zero opacity directly
 * over a Mantine button that matches everything around it: the click lands on
 * Google's element, the eye sees ours.
 *
 * The visual layer is `aria-hidden` and the overlay carries the accessible
 * label, so a screen reader is told about one button rather than two.
 *
 * Renders a disabled placeholder when `VITE_GOOGLE_CLIENT_ID` is unset, so a
 * deployment without Google configured says so instead of offering a button that
 * fails when pressed.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCRIPT_ID = "google-gsi";
/** Matches Mantine's `size="md"` button, so the overlay covers ours exactly. */
const HEIGHT = 42;

type GsiButtonOptions = {
  type: "standard" | "icon";
  theme: "outline" | "filled_blue" | "filled_black";
  size: "small" | "medium" | "large";
  text: "signin_with" | "signup_with" | "continue_with";
  shape: "rectangular" | "pill";
  logo_alignment?: "left" | "center";
  width?: number;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: GsiButtonOptions) => void;
        };
      };
    };
  }
}

export function googleConfigured(): boolean {
  return Boolean(CLIENT_ID);
}

/** Google's mark, at the size Mantine's `leftSection` expects. */
function GoogleIcon() {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type Props = {
  /** The label on our own button. */
  label?: string;
  /** "signup_with" on the signup page. Invisible, but it is what GIS announces. */
  text?: GsiButtonOptions["text"];
  /** Runs after a successful sign-in — navigation, a toast, whatever the page needs. */
  onSuccess: (created: boolean) => void;
  onError: (message: string) => void;
  /** Called as the exchange starts, so the page can disable its own controls. */
  onBusyChange?: (busy: boolean) => void;
};

export default function GoogleSignInButton({
  label = "Continue with Google",
  text = "signin_with",
  onSuccess,
  onError,
  onBusyChange,
}: Props) {
  const { googleSignIn } = useAuth();
  const holder = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);
  const [busy, setBusy] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  // The GIS button takes a fixed pixel width, not a percentage, so it has to be
  // measured from the container and re-measured when the window changes —
  // otherwise the invisible click target stops covering the visible button.
  useEffect(() => {
    const el = holder.current;
    if (!el) return;
    const measure = () => setWidth(Math.round(el.getBoundingClientRect().width));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleCredential = useCallback(
    async (response: { credential: string }) => {
      setBusy(true);
      // The overlay stops taking pointer events while busy, so it will never
      // send the matching pointerup/leave. Clearing here keeps the button from
      // staying visually pressed for the whole exchange.
      setPressed(false);
      setHovered(false);
      onBusyChange?.(true);
      try {
        const { created } = await googleSignIn(response.credential);
        onSuccess(created);
      } catch (err) {
        const message =
          err && typeof err === "object" && "message" in err
            ? String((err as { message: unknown }).message)
            : "Google sign-in failed. Try again in a moment.";
        onError(message);
      } finally {
        setBusy(false);
        onBusyChange?.(false);
      }
    },
    [googleSignIn, onSuccess, onError, onBusyChange]
  );

  const render = useCallback(() => {
    if (!window.google || !CLIENT_ID || !holder.current || !width) return;

    // Re-rendering appends a second button, so the container is cleared first —
    // this runs again on every width change and on hot reload.
    holder.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredential,
    });

    window.google.accounts.id.renderButton(holder.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text,
      shape: "rectangular",
      logo_alignment: "center",
      width,
    });
  }, [handleCredential, text, width]);

  useEffect(() => {
    if (!CLIENT_ID) return;

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (window.google) render();
      else existing.addEventListener("load", render, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.addEventListener("load", render, { once: true });
    document.body.appendChild(script);
    // The script is left in place deliberately: it is shared by every page that
    // offers Google sign-in, and removing it would force a re-download.
  }, [render]);

  if (!CLIENT_ID) {
    return (
      <Button variant="default" fullWidth size="md" disabled leftSection={<GoogleIcon />}>
        Google sign-in unavailable
      </Button>
    );
  }

  return (
    <Box
      pos="relative"
      h={HEIGHT}
      // Hover and press are tracked here rather than on the visual button: that
      // button has pointer events switched off so clicks can reach Google's, and
      // an element that never sees the pointer never matches :hover. The wrapper
      // does see it, so it is what tells the button how to look.
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
    >
      {/* The button people see. Hidden from assistive tech: the overlay below is
          the real control, and announcing both would read as two buttons. */}
      <Button
        variant="default"
        fullWidth
        size="md"
        loading={busy}
        leftSection={busy ? undefined : <GoogleIcon />}
        aria-hidden="true"
        // Mantine's own :hover cannot fire here, so the hover and active looks
        // are applied directly — same variables Mantine's `default` variant uses,
        // so this tracks the theme rather than hard-coding a grey.
        style={{
          pointerEvents: "none",
          backgroundColor: hovered
            ? "var(--mantine-color-default-hover)"
            : undefined,
          transform: pressed ? "translateY(1px)" : undefined,
          transition: "background-color 100ms ease",
        }}
      >
        {label}
      </Button>

      {/* Google's own button, invisible but clickable and full-size. Once a
          sign-in is in flight it stops taking clicks, so a second press can't
          start a second exchange. */}
      <Box
        ref={holder}
        pos="absolute"
        inset={0}
        aria-label={label}
        style={{
          opacity: 0,
          overflow: "hidden",
          colorScheme: "light",
          cursor: busy ? "default" : "pointer",
          pointerEvents: busy ? "none" : "auto",
        }}
      />
    </Box>
  );
}
