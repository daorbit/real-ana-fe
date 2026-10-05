const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export type AutoProvider = "google" | "linkedin" | "github";

export const OAUTH_START_URL: Record<AutoProvider, string> = {
  google: `${API_BASE}/api/auth/google-oauth`,
  github: `${API_BASE}/api/auth/github`,
  linkedin: `${API_BASE}/api/auth/linkedin?mode=login`,
};

export const GOOGLE_REDIRECT_CONFIG_URL = `${API_BASE}/api/auth/google-oauth/config`;

export const PROVIDER_LABEL: Record<AutoProvider, string> = {
  google: "Google",
  linkedin: "LinkedIn",
  github: "GitHub",
};

const PROVIDERS: AutoProvider[] = ["google", "linkedin", "github"];

export function readProvider(value: string | null): AutoProvider | null {
  return PROVIDERS.includes(value as AutoProvider) ? (value as AutoProvider) : null;
}
