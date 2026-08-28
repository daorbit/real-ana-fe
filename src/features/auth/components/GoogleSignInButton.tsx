import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Button, Tooltip } from "@mantine/core";
import { useAuth } from "@/features/auth/context";



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
            use_fedcm_for_prompt?: boolean;
            auto_select?: boolean;
            itp_support?: boolean;
          }) => void;
          renderButton: (parent: HTMLElement, options: GsiButtonOptions) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export function googleConfigured(): boolean {
  return Boolean(CLIENT_ID);
}

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
  label?: string;
  text?: GsiButtonOptions["text"];
  /** Show the One Tap card automatically on mount. Off inside modals. */
  oneTap?: boolean;
  onSuccess: (created: boolean) => void;
  onError: (message: string) => void;
  onBusyChange?: (busy: boolean) => void;
};

export default function GoogleSignInButton({
  label = "Continue with Google",
  text = "signin_with",
  oneTap = false,
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

    if (oneTap) window.google.accounts.id.prompt();
  }, [handleCredential, text, width, oneTap]);

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
          <Button variant="default" fullWidth size="md" disabled leftSection={<GoogleIcon />}>
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
        leftSection={busy ? undefined : <GoogleIcon />}
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
