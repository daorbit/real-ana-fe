import { Progress } from "@mantine/core";
import { dateTime } from "@/shared/lib/format";
import { sentShare } from "@/features/campaigns/lib/campaignStatus";
import type { Campaign } from "@/features/campaigns/types";
import classes from "./Report.module.css";

function rate(value: number, total: number): string {
  if (!total) return "0%";
  return `${Math.round((value / total) * 1000) / 10}%`;
}

function timeline(campaign: Campaign): string {
  if (campaign.finishedAt) return `Finished ${dateTime(campaign.finishedAt)}`;
  if (campaign.startedAt) return `Started ${dateTime(campaign.startedAt)}`;
  return "Not sent yet";
}

export function CampaignSummary({ campaign }: { campaign: Campaign }) {
  const { total, sent, failed, unsubscribed } = campaign.counts;
  const done = campaign.status === "sent";
  const meter = done ? (total ? (sent / total) * 100 : 0) : sentShare(campaign);
  const stats = [
    { label: "Recipients", value: total.toLocaleString(), note: "After unsubscribes" },
    { label: "Failed", value: failed.toLocaleString(), note: `${rate(failed, total)} of recipients` },
    { label: "Unsubscribed", value: unsubscribed.toLocaleString(), note: `${rate(unsubscribed, sent)} of delivered` },
  ];

  return (
    <section className={classes.report} aria-label="Campaign results">
      <div className={classes.hero}>
        <span className={classes.label}>{done ? "Delivered" : "Sent so far"}</span>
        <div className={classes.figure}>
          <span className={classes.big}>{sent.toLocaleString()}</span>
          <span className={classes.of}>of {total.toLocaleString()}</span>
          <span className={classes.rate}>{rate(sent, total)}</span>
        </div>
        <Progress value={meter} size={6} color="var(--accent)" aria-label="Emails delivered" />
        <span className={classes.timeline}>{timeline(campaign)}</span>
      </div>
      <dl className={classes.stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={classes.stat}>
            <dt className={classes.label}>{stat.label}</dt>
            <dd className={classes.statValue}>{stat.value}</dd>
            <dd className={classes.statNote}>{stat.note}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
