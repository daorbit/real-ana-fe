import { useGetCampaignFailuresQuery } from "@/features/campaigns/api";
import classes from "../Campaigns.module.css";

export function CampaignFailures({ workspaceId, id }: { workspaceId: string; id: string }) {
  const { data } = useGetCampaignFailuresQuery({ workspaceId, id });
  const failures = data?.failures ?? [];
  if (!failures.length) return null;

  return (
    <div className={classes.failures}>
      <div className={classes.sectionHead}>
        <h3 className={classes.sectionTitle}>Failed addresses</h3>
        <span className={classes.sectionMeta}>Showing up to 50</span>
      </div>
      <div className={classes.list}>
        {failures.map((failure) => (
          <div key={failure.email} className={classes.failureRow}>
            <span className={classes.failureEmail}>{failure.email}</span>
            <span>{failure.error}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
