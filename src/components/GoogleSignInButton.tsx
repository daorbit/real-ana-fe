import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Text } from "@mantine/core";
import { useAuth } from "../auth";

/**
 * Google Identity Services sign-in.
 *
 * Google's own button is rendered rather than a lookalike wired to a custom
 * handler: the credential is only issued to a genuine GIS button, and Google's
 * terms require their branding on it. The button is mounted into a container we
 * own so its width can be made to match the form around it.
 *
 * Renders nothing when `VITE_GOOGLE_CLIENT_ID` is unset, so a deployment
 * without Google configured simply has no Google option instead of a button
 * that fails when pressed.
 */

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCRIPT_ID = "google-gsi";

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

type Props = {
  /** "signup_with" on the signup page, so the button reads the way the page does. */
  text?: GsiButtonOptions["text"];
  /** Runs after a successful sign-in — navigation, a toast, whatever the page needs. */
  onSuccess: (created: boolean) => void;
  onError: (message: string) => void;
  /** Called as the exchange starts, so the page can disable its own controls. */
  onBusyChange?: (busy: boolean) => void;
};

export default function GoogleSignInButton({
  text = "signin_with",
  onSuccess,
  onError,
  onBusyChange,
}: Props) {
  const { googleSignIn } = useAuth();
  const holder = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(0);

  // The GIS button takes a fixed pixel width, not a percentage, so it has to be
  // measured from the container and re-measured when the window changes.
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
      <Text c="dimmed" size="xs" ta="center">
        Google sign-in is not configured.
      </Text>
    );
  }

  // Fixed height reserves the button's space before GIS renders into it, so the
  // form does not jump once the script lands.
  return <Box ref={holder} mih={40} />;
}
