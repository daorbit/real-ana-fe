import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  GOOGLE_REDIRECT_CONFIG_URL,
  OAUTH_START_URL,
  readProvider,
  type AutoProvider,
} from "@/features/auth/oauthStart";

const REDIRECT_DELAY_MS = 600;
const CONFIG_TIMEOUT_MS = 3000;

export type AutostartMode = "redirect" | "prompt";

async function googleRedirectReady(): Promise<boolean> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), CONFIG_TIMEOUT_MS);
  try {
    const res = await fetch(GOOGLE_REDIRECT_CONFIG_URL, { signal: controller.signal });
    const body = (await res.json()) as { configured?: boolean };
    return Boolean(body.configured);
  } catch {
    return false;
  } finally {
    window.clearTimeout(timer);
  }
}

export function useProviderAutostart(): { provider: AutoProvider | null; mode: AutostartMode | null } {
  const [params, setParams] = useSearchParams();
  const [provider] = useState(() => readProvider(params.get("provider")));
  const [mode, setMode] = useState<AutostartMode | null>(() =>
    provider && provider !== "google" ? "redirect" : null,
  );

  useEffect(() => {
    if (!provider) return;

    const next = new URLSearchParams(window.location.search);
    if (next.has("provider")) {
      next.delete("provider");
      setParams(next, { replace: true });
    }

    let cancelled = false;
    let timer: number | undefined;

    const go = () => {
      timer = window.setTimeout(() => window.location.assign(OAUTH_START_URL[provider]), REDIRECT_DELAY_MS);
    };

    if (provider === "google") {
      void googleRedirectReady().then((ready) => {
        if (cancelled) return;
        setMode(ready ? "redirect" : "prompt");
        if (ready) go();
      });
    } else {
      go();
    }

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [provider, setParams]);

  return { provider, mode };
}
