import { getToken } from "@/shared/lib/http";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export function socialConnectUrl(provider: "linkedin" | "instagram", workspaceId: string): string {
  const params = new URLSearchParams({ token: getToken() ?? "", workspaceId });
  return `${API_BASE}/api/auth/${provider}?${params.toString()}`;
}
