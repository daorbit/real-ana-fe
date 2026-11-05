import { useEffect, useState } from "react";
import { usePreviewCampaignMutation } from "@/features/campaigns/api";
import type { CampaignInput } from "@/features/campaigns/types";

const DEBOUNCE_MS = 800;

export function useCampaignPreview(workspaceId: string | undefined, draft: CampaignInput): string {
  const [preview] = usePreviewCampaignMutation();
  const [html, setHtml] = useState("");
  const { mode, design, preheader, senderAddress, subject } = draft;
  const custom = draft.html;

  useEffect(() => {
    if (!workspaceId) return;
    const timer = window.setTimeout(() => {
      void preview({ workspaceId, name: "Preview", subject, preheader, mode, design, html: custom, senderAddress, formIds: [], imported: [] })
        .unwrap()
        .then((result) => setHtml(result.html))
        .catch(() => undefined);
    }, DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [workspaceId, preview, subject, preheader, mode, design, custom, senderAddress]);

  return html;
}
