import { useCallback, useState } from "react";
import { notify } from "@/shared/lib/notify";
import { classifyAuthError, classifyAuthMessage, type AuthProvider, type AuthToast } from "@/features/auth/authToast";

export function useAuthToast() {
  const [highlight, setHighlight] = useState<AuthProvider | null>(null);

  const show = useCallback((toast: AuthToast) => {
    setHighlight(toast.provider ?? null);
    if (toast.tone === "error") notify.error(toast.message);
    else notify.info(toast.message);
  }, []);

  const showMessage = useCallback((message: string) => show(classifyAuthMessage(message)), [show]);

  const showError = useCallback(
    (error: unknown, fallback: string) => show(classifyAuthError(error, fallback)),
    [show],
  );

  const clear = useCallback(() => setHighlight(null), []);

  return { highlight, showMessage, showError, clear };
}
