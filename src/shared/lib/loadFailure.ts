import { notify } from "@/shared/lib/notify";

const COOLDOWN_MS = 20_000;
let lastShown = 0;

export function reportLoadFailure(signal?: AbortSignal) {
  if (signal?.aborted) return;
  if (typeof navigator !== "undefined" && navigator.onLine === false) return;

  const now = Date.now();
  if (now - lastShown < COOLDOWN_MS) return;
  lastShown = now;

  notify.error(
    "Some information on this page couldn't be loaded. It will retry when you come back to this tab, or you can refresh the page.",
    "Couldn't load data",
  );
}
