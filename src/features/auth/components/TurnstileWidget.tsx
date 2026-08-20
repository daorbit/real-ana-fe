import { useEffect, useRef } from "react";
import { Box } from "@mantine/core";
import { useComputedColorScheme } from "@mantine/core";

/**
 * The public Turnstile sitekey. Safe in the bundle — that is what a sitekey is
 * for. The matching `CLOUDFLARE_SECRET_KEY` is a backend variable and appears
 * nowhere in this app.
 *
 * Read without the `VITE_` prefix because the variable already exists under
 * this exact name; `vite.config.ts` widens `envPrefix` to let it through.
 */
const SITE_KEY = import.meta.env.CLOUDFLARE_SITE_KEY as string | undefined;
const SCRIPT_ID = "cf-turnstile";
const SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

type TurnstileOptions = {
  sitekey: string;
  callback: (token: string) => void;
  "expired-callback": () => void;
  "error-callback": () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "flexible" | "compact";
};

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: TurnstileOptions) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId?: string) => void;
    };
  }
}

/**
 * Whether the challenge is switched on for this build.
 *
 * Lets the login form skip its "complete the security check" gate when no
 * sitekey is configured, so a local checkout without Turnstile set up is not
 * left with an un-passable form. The server makes the same call independently
 * — this is a UI convenience, never the thing that decides whether a login is
 * allowed through.
 */
export function turnstileConfigured(): boolean {
  return Boolean(SITE_KEY);
}

/** Loads the Turnstile script once per page, reusing it across mounts. */
function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();

    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("turnstile script failed")));
      return;
    }

    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile script failed"));
    document.head.appendChild(s);
  });
}

type Props = {
  /** Fires with a fresh token each time the challenge is passed. */
  onVerify: (token: string) => void;
  /**
   * Fires when the token is gone and cannot be used: expired, or the widget
   * errored. The parent clears its held token in response.
   */
  onExpire: () => void;
};

/**
 * The Cloudflare Turnstile checkbox.
 *
 * Rendered explicitly rather than via the `cf-turnstile` auto-render class:
 * auto-render scans the DOM on script load, which loses the race with a
 * client-routed page that mounts afterwards.
 */
export default function TurnstileWidget({ onVerify, onExpire }: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const widgetId = useRef<string | null>(null);
  const scheme = useComputedColorScheme("light");

  // The callbacks are held in refs so a re-render of the parent (every
  // keystroke in the email field) does not tear down and re-render the widget,
  // which would drop a token the user had already earned.
  const verify = useRef(onVerify);
  const expire = useRef(onExpire);
  verify.current = onVerify;
  expire.current = onExpire;

  useEffect(() => {
    if (!SITE_KEY) return;
    let cancelled = false;

    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        // Strict mode mounts twice in development; without this the second
        // pass stacks a duplicate widget under the first.
        if (widgetId.current) return;

        widgetId.current = window.turnstile.render(ref.current, {
          sitekey: SITE_KEY,
          size: "flexible",
          theme: scheme === "dark" ? "dark" : "light",
          callback: (token) => verify.current(token),
          // Turnstile tokens are single-use and short-lived. Both paths mean
          // "there is no usable token now", which is the parent's cue to clear
          // the one it is holding.
          "expired-callback": () => expire.current(),
          "error-callback": () => expire.current(),
        });
      })
      .catch(() => {
        // A blocked or unreachable script leaves no widget and so no token.
        // The parent surfaces that as a validation message on submit rather
        // than as an error banner on a form nobody has filled in yet.
        if (!cancelled) expire.current();
      });

    return () => {
      cancelled = true;
      if (widgetId.current && window.turnstile) {
        window.turnstile.remove(widgetId.current);
        widgetId.current = null;
      }
    };
    // Deliberately mount-only. `scheme` is read for the initial theme but left
    // out of the deps: re-rendering the widget on a theme toggle would throw
    // away a valid token mid-login, which is a worse trade than a checkbox that
    // keeps its old theme until the page is reloaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!SITE_KEY) return null;

  return <Box ref={ref} mih={65} />;
}
