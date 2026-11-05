import { Badge } from "@mantine/core";
import { STATUS_COLOR, STATUS_LABEL } from "@/features/campaigns/lib/campaignLabels";
import type { CampaignStatus } from "@/features/campaigns/types";

export function CampaignStatusBadge({ status }: { status: CampaignStatus }) {
  return (
    <Badge variant="light" color={STATUS_COLOR[status]}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
