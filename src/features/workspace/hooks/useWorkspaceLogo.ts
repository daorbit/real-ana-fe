import { useState } from "react";
import type { WorkspaceIcon } from "@/shared/types";

const QUANTALOG_MARK = "/brand-mark.png";
export const QUANTALOG_MARK_LARGE = "/favicon-rounded.png";

export function useWorkspaceLogo(icon?: WorkspaceIcon | null, fallback = QUANTALOG_MARK) {
  const logo = icon?.logoUrl ?? null;
  const [failed, setFailed] = useState<string | null>(null);

  if (!logo || failed === logo) return { src: fallback, onError: undefined };
  return { src: logo, onError: () => setFailed(logo) };
}
