import type { ApiError } from "@/shared/lib/http";
import { errMessage } from "@/shared/lib/notify";

export type AuthProvider = "google" | "linkedin" | "github";

export type AuthToast = {
  tone: "error" | "neutral";
  message: string;
  provider?: AuthProvider;
};

const PROVIDER_LABEL: Record<AuthProvider, string> = {
  google: "Google",
  linkedin: "LinkedIn",
  github: "GitHub",
};

function sentence(message: string): string {
  const text = message.trim();
  if (!text) return text;
  const capped = text[0].toUpperCase() + text.slice(1);
  return /[.!?]$/.test(capped) ? capped : `${capped}.`;
}

function providerFrom(message: string, body?: Record<string, unknown> | null): AuthProvider | null {
  const fromBody = typeof body?.provider === "string" ? body.provider.toLowerCase() : null;
  if (fromBody && fromBody in PROVIDER_LABEL) return fromBody as AuthProvider;
  const match = /uses (google|linkedin|github) sign-in/i.exec(message);
  return match ? (match[1].toLowerCase() as AuthProvider) : null;
}

export function classifyAuthMessage(
  message: string,
  { status, body }: { status?: number; body?: Record<string, unknown> | null } = {},
): AuthToast {
  const provider = providerFrom(message, body);
  if (provider) {
    const name = PROVIDER_LABEL[provider];
    return { tone: "error", message: `This account uses ${name} — continue with the ${name} button.`, provider };
  }
  if (/invalid credentials/i.test(message)) {
    return { tone: "error", message: "Wrong email or password." };
  }
  if (body?.turnstile || /security check/i.test(message)) {
    return { tone: "error", message: "Security check didn't finish — try again in a moment." };
  }
  if (/try logging in|already be registered|just registered/i.test(message)) {
    return { tone: "neutral", message: "This email may already have an account — try logging in." };
  }
  if ((status !== undefined && status >= 500) || /failed to fetch|network/i.test(message)) {
    return { tone: "error", message: "Can't reach Quantalog — check your connection and try again." };
  }
  return { tone: "error", message: sentence(message) };
}

export function classifyAuthError(error: unknown, fallback: string): AuthToast {
  const e = error as ApiError;
  return classifyAuthMessage(errMessage(error, fallback), { status: e?.status, body: e?.body });
}
