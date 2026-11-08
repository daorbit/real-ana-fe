import type { ReactNode } from "react";
import { Progress } from "@mantine/core";
import { ChevronRight, Mail, Send, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import type { CampaignSources, CampaignUsage } from "@/features/campaigns/types";
import classes from "./Campaigns.module.css";

interface Props {
  usage: CampaignUsage | undefined;
  sources: CampaignSources | undefined;
}

function meterColor(percent: number): string {
  if (percent >= 100) return "var(--red)";
  if (percent >= 80) return "var(--amber)";
  return "var(--accent)";
}

function Cell({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: ReactNode }) {
  return (
    <div className={classes.cell}>
      <div className={classes.cellLabel}>
        <Icon size={14} aria-hidden />
        {label}
      </div>
      {children}
    </div>
  );
}

export function SendingStrip({ usage, sources }: Props) {
  const used = usage?.used ?? 0;
  const limit = usage?.limit ?? 0;
  const percent = limit ? Math.min(100, (used / limit) * 100) : 0;
  const forms = sources?.forms ?? [];
  const responses = forms.reduce((sum, form) => sum + form.responses, 0);
  const delivery = sources?.delivery;

  return (
    <section aria-label="Your sending at a glance" className={classes.strip}>
      <Cell icon={Mail} label="Emails this month">
        <div className={classes.cellValue}>
          {used.toLocaleString()}
          <span className={classes.cellOf}> of {limit.toLocaleString()}</span>
        </div>
        <Progress value={percent} size={4} color={meterColor(percent)} aria-label="Campaign emails used this month" />
      </Cell>
      <Cell icon={Users} label="People you can reach">
        <div className={classes.cellValue}>{responses.toLocaleString()}</div>
        <div className={classes.cellNote}>
          From {forms.length} {forms.length === 1 ? "form" : "forms"}. Unsubscribes are left out.
        </div>
      </Cell>
      <Cell icon={Send} label="Sending through">
        <div className={classes.cellValue} data-muted={!delivery?.connected || undefined}>
          {delivery?.connected ? delivery.providerName : "No provider yet"}
        </div>
        <Link to="/app/apps" className={classes.cellLink}>
          {delivery?.connected ? "Change in Apps" : "Connect one in Apps"}
          <ChevronRight size={13} aria-hidden />
        </Link>
      </Cell>
    </section>
  );
}
