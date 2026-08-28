import type { User } from "@/shared/types";

 
const KEY = "quantalog_last_user";

export type LastUser = {
  name: string;
  email: string;
  avatarUrl: string;
  method: "password" | "google" | "linkedin";
};

export function rememberUser(user: User, method: LastUser["method"]) {
  try {
    const entry: LastUser = {
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl ?? "",
      method,
    };
    localStorage.setItem(KEY, JSON.stringify(entry));
  } catch {
    /* private mode — the feature is a convenience, not a requirement */
  }
}

export function getLastUser(): LastUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<LastUser>;
    if (!parsed.email) return null;
    return {
      name: parsed.name ?? parsed.email,
      email: parsed.email,
      avatarUrl: parsed.avatarUrl ?? "",
      method: parsed.method ?? "password",
    };
  } catch {
    return null;
  }
}

export function forgetLastUser() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to clear */
  }
}
