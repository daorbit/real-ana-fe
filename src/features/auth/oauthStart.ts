const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export type AutoProvider = "google" | "linkedin" | "github";

export type RedirectProvider = Exclude<AutoProvider, "google">;

export const OAUTH_START_URL: Record<RedirectProvider, string> = {
  github: `${API_BASE}/api/auth/github`,
  linkedin: `${API_BASE}/api/auth/linkedin?mode=login`,
};

export const PROVIDER_LABEL: Record<AutoProvider, string> = {
  google: "Google",
  linkedin: "LinkedIn",
  github: "GitHub",
};

const PROVIDERS: AutoProvider[] = ["google", "linkedin", "github"];

export function readProvider(value: string | null): AutoProvider | null {
  return PROVIDERS.includes(value as AutoProvider) ? (value as AutoProvider) : null;
}
