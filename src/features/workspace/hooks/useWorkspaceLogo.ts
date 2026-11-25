import { useState } from "react";
import type { WorkspaceIcon } from "@/shared/types";

export function useWorkspaceLogo(icon?: WorkspaceIcon | null) {
  const logo = icon?.logoUrl ?? null;
  const [failed, setFailed] = useState<string | null>(null);

  if (!logo || failed === logo) return { src: null, onError: undefined };
  return { src: logo, onError: () => setFailed(logo) };
}