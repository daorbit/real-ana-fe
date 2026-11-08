import { useCreateCampaign } from "@/features/campaigns/hooks/useCreateCampaign";
import { CampaignStartOverlay } from "./CampaignStartOverlay";
import { TemplateGallery } from "./TemplateGallery";

export function TemplatePicker({ workspaceId, lastAddress }: { workspaceId: string | undefined; lastAddress: string }) {
  const { start, creating, picked } = useCreateCampaign(workspaceId, lastAddress);
  return (
    <>
      <TemplateGallery disabled={creating} onPick={(template) => void start(template)} />
      <CampaignStartOverlay templateName={picked} />
    </>
  );
}
