import type { User } from "@/shared/types";

export type IdentityProof = { password: string } | { code: string };

export function identityProof(user: User, value: string): IdentityProof {
  return user.hasPassword ? { password: value } : { code: value.trim() };
}

export function identityPrompt(user: User): string {
  if (user.hasPassword) return "Confirm your password";
  if (user.hasPin && user.totpEnabled) return "Confirm with your PIN or a code from your authenticator app";
  if (user.totpEnabled) return "Confirm with a code from your authenticator app";
  return "Confirm with your PIN";
}
