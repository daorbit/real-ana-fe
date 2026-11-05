import { useEffect, useState } from "react";
import { usePreviewCampaignMutation } from "@/features/campaigns/api";
import type { CampaignInput } from "@/features/campaigns/types";

const DEBOUNCE_MS = 700;

export function useCampaignPreview(workspaceId: string | undefined, draft: CampaignInput): string {
  const [preview] = usePreviewCampaignMutation();
  const [html, setHtml] = useState("");

  useEffect(() => {
    if (!workspaceId) return;
    const timer = window.setTimeout(() => {
      void preview({ workspaceId, ...draft, imported: [], name: draft.name || "Preview" })
        .unwrap()
        .then((result) => setHtml(result.html))
        .catch(() => undefined);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [workspaceId, preview, draft.body, draft.ctaLabel, draft.ctaUrl, draft.senderAddress, draft.subject, draft.name]);

  return html;
}
