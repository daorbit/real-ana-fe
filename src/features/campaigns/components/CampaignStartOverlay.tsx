import { createPortal } from "react-dom";
import { SwitchVisual } from "@/shared/ui/SwitchOverlay";

export function CampaignStartOverlay({ templateName }: { templateName: string | null }) {
  if (!templateName) return null;
  return createPortal(
    <SwitchVisual loop label="Setting up your campaign" sublabel={`Starting from ${templateName}`} />,
    document.body,
  );
}
