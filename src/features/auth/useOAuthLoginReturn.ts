import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth/context";
import type { LoginMethod } from "@/features/auth/lastUser";
import { notify } from "@/shared/lib/notify";

type Options = {
  param: string;
  method: LoginMethod;
  provider: string;
  onError?: (message: string) => void;
  onRequires2fa?: (pendingToken: string) => void;
};

function failureMessage(provider: string, reason: string | null): string {
  switch (reason) {
    case "not_configured":
      return `${provider} sign-in is not configured yet.`;
    case "no_email":
      return `Your ${provider} account has no verified email address. Add one on ${provider} and try again.`;
    case "invalid_state":
      return `That ${provider} sign-in attempt expired. Please try again.`;
    default:
      return `Could not sign in with ${provider}. Please try again.`;
  }
}

export function useOAuthLoginReturn({ param, method, provider, onError, onRequires2fa }: Options) {
  const { adoptToken } = useAuth();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const params = new URLSearchParams(window.location.search);
    const status = params.get(param);
    if (!status) return;

    handled.current = true;
    window.history.replaceState({}, "", window.location.pathname);

    const fail = () => onError?.(failureMessage(provider, params.get("reason")));

    if (status === "2fa") {
      const pendingToken = params.get("pendingToken");
      if (pendingToken && onRequires2fa) onRequires2fa(pendingToken);
      else fail();
      return;
    }

    if (status === "cancelled") return;

    const token = params.get("token");
    const created = status === "created";
    if ((status !== "ok" && !created) || !token) {
      fail();
      return;
    }

    setBusy(true);
    adoptToken(token, method, created)
      .then(() => {
        if (created) {
          notify.success("Account created. Let's get you tracking.", `Signed up with ${provider}`);
          nav("/app/onboarding");
        } else {
          notify.success("Welcome back!", "Logged in");
          nav("/app");
        }
      })
      .catch(fail)
      .finally(() => setBusy(false));
  }, [adoptToken, nav, onError, onRequires2fa, param, method, provider]);

  return [busy, setBusy] as const;
}
