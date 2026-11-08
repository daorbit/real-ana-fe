import type { Campaign } from "@/features/campaigns/types";
import { CampaignPreview } from "@/features/campaigns/components/CampaignCard";
import classes from "./Report.module.css";

export function CampaignEmailCard({ campaign }: { campaign: Campaign }) {
  const rows = [
    { label: "Subject", value: campaign.subject || "No subject" },
    { label: "Preview text", value: campaign.preheader || "None" },
    { label: "From", value: campaign.senderAddress || "Your connected sender" },
  ];

  return (
    <aside className={classes.email} aria-label="The email">
      <CampaignPreview campaign={campaign} tall />
      <dl className={classes.emailMeta}>
        {rows.map((row) => (
          <div key={row.label} className={classes.emailRow}>
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
