import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { OAUTH_START_URL, readProvider, type AutoProvider } from "@/features/auth/oauthStart";

const REDIRECT_DELAY_MS = 600;

export function useProviderAutostart(): AutoProvider | null {
  const [params, setParams] = useSearchParams();
  const [provider] = useState(() => readProvider(params.get("provider")));

  useEffect(() => {
    if (!provider) return;

    const next = new URLSearchParams(window.location.search);
    if (next.has("provider")) {
      next.delete("provider");
      setParams(next, { replace: true });
    }

    const id = window.setTimeout(() => window.location.assign(OAUTH_START_URL[provider]), REDIRECT_DELAY_MS);
    return () => window.clearTimeout(id);
  }, [provider, setParams]);

  return provider;
}
