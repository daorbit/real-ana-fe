export const ORBIT_EXTENSION_URL =
  "https://chromewebstore.google.com/detail/orbit-ai/ilmdbgnbkgjldhelepoadfkmpahelmkg";

const STORE_KEY = "quantalog:orbit-extension-prompt";

export function canInstallOrbitExtension(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Chrome\/|Chromium\/|Edg\//.test(ua) && !/Mobi|Android|CriOS/.test(ua);
}

export function readOrbitExtensionDismissal(): number | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const until = raw ? Number(raw) : NaN;
    return Number.isFinite(until) ? until : null;
  } catch {
    return null;
  }
}

export function writeOrbitExtensionDismissal(until: number): void {
  try {
    localStorage.setItem(STORE_KEY, String(until));
  } catch {
    return;
  }
}
