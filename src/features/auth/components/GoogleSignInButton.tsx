import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Tooltip } from "@mantine/core";
import { useAuth } from "@/features/auth/context";
import { GoogleMark } from "@/shared/ui/GoogleMark";



const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const SCRIPT_ID = "google-gsi";
/** The auth form restyles `variant="default"` buttons to this height, so the
    invisible GSI overlay has to track it or it stops covering our button. */
const HEIGHT = 46;

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
            use_fedcm_for_prompt?: boolean;
            auto_select?: boolean;
            itp_support?: boolean;
          }) => void;
          renderButton: (parent: HTMLElement, options: GsiButtonOptions) => void;
          prompt: () => void;
          cancel: () => void;
        };
      };
    };
  }
}

export function googleConfigured(): boolean {
  return Boolean(CLIENT_ID);
}


type Props = {
  label?: string;
  text?: GsiButtonOptions["text"];
  /** Show the One Tap card automatically on mount. Off inside modals. */
  oneTap?: boolean;
  onSuccess: (created: boolean) => void;
  onRequires2fa: (pendingToken: string) => void;
  onError: (message: string) => void;
  onBusyChange?: (busy: boolean) => void;
};

export default function GoogleSignInButton({
  label = "Continue with Google",
  text = "signin_with",
  oneTap = false,
  onSuccess,
  onRequires2fa,
  onError,
  onBusyChange,
}: Props) {
  const { googleSignIn } = useAuth();
  const holder = useRef<HTMLDivElement | null>(null);
  const prompted = useRef(false);
  const [width, setWidth] = useState(0);
  const [busy, setBusy] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

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
      setPressed(false);
      setHovered(false);
      onBusyChange?.(true);
      try {
        const result = await googleSignIn(response.credential);
        // Close the One Tap card before the caller navigates away — otherwise it
        // lingers on the next page and prompts a second time.
        window.google?.accounts.id.cancel();
        if (result.requires2fa) onRequires2fa(result.pendingToken);
        else onSuccess(result.created);
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
    [googleSignIn, onSuccess, onRequires2fa, onError, onBusyChange]
  );

  const render = useCallback(() => {
    if (!window.google || !CLIENT_ID || !holder.current || !width) return;

    holder.current.innerHTML = "";

    window.google.accounts.id.initialize({
      client_id: CLIENT_ID,
      callback: handleCredential,
      // Renders the account chooser as Chrome's native FedCM mini-dialog rather
      // than a separate popup window that a blocker can eat.
      use_fedcm_for_prompt: true,
      itp_support: true,
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

    // Once only: `render` re-runs whenever the button is remeasured, and each
    // extra `prompt()` re-opens the card the user may have just dismissed.
    if (oneTap && !prompted.current) {
      prompted.current = true;
      window.google.accounts.id.prompt();
    }
  }, [handleCredential, text, width, oneTap]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    return () => window.google?.accounts.id.cancel();
  }, []);

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
  }, [render]);

  // The button shares a `Group grow` row with LinkedIn, so it only gets half the
  // form width — the old copy overflowed and truncated mid-word. The reason
  // moves to the tooltip, which has room for it.
  if (!CLIENT_ID) {
    return (
      <Tooltip label="Google sign-in is not configured" withArrow>
        {/* A disabled button fires no pointer events, so the tooltip would
            never open without a wrapper to listen on. */}
        <Box>
          <Button variant="default" fullWidth size="md" disabled leftSection={<GoogleMark />}>
            Google
          </Button>
        </Box>
      </Tooltip>
    );
  }

  return (
    <Box
      pos="relative"
      h={HEIGHT} 
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => {
        setHovered(false);
        setPressed(false);
      }}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
    >
      <Button
        variant="default"
        fullWidth
        size="md"
        loading={busy}
        leftSection={busy ? undefined : <GoogleMark />}
        aria-hidden="true"

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
