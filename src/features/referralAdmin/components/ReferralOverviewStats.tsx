import { Progress, Skeleton } from "@mantine/core";
import { Clock, Flag, KeyRound, Ticket } from "lucide-react";
import { useGetAdminReferralOverviewQuery } from "@/app/store";
import { num } from "@/shared/lib";
import classes from "./ReferralAdmin.module.css";

function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export function ReferralOverviewStats() {
  const { data } = useGetAdminReferralOverviewQuery();

  if (!data) {
    return (
      <div className={classes.overview}>
        <Skeleton h={190} radius="lg" />
        <Skeleton h={190} radius="lg" />
      </div>
    );
  }

  const funnel = [
    { label: "Joined with a link", value: data.total, share: 100, note: "All referred signups" },
    {
      label: "Rewarded",
      value: data.rewarded,
      share: pct(data.rewarded, data.total),
      note: `${pct(data.rewarded, data.total)}% of signups`,
    },
    {
      label: "Coupon used",
      value: data.couponsRedeemed,
      share: pct(data.couponsRedeemed, data.total),
      note: `${pct(data.couponsRedeemed, data.rewarded + data.revoked)}% of coupons issued`,
    },
  ];

  const attention = [
    { icon: Clock, label: "Waiting for review", value: data.pending, tone: data.pending ? "warn" : undefined },
    { icon: Flag, label: "Flagged as same network", value: data.flagged, tone: data.flagged ? "danger" : undefined },
    { icon: Ticket, label: "Coupons not used yet", value: data.couponsReady },
    { icon: KeyRound, label: "Referral codes created", value: data.codes },
  ];

  return (
    <div className={classes.overview}>
      <section className={classes.panel}>
        <header className={classes.panelHead}>
          <h3 className={classes.panelTitle}>Program funnel</h3>
          <span className={classes.panelMeta}>
            {num(data.rejected)} rejected · {num(data.revoked)} revoked
          </span>
        </header>
        <div className={classes.funnel}>
          {funnel.map((step) => (
            <div key={step.label} className={classes.funnelStep}>
              <span className={classes.funnelLabel}>{step.label}</span>
              <span className={classes.funnelValue}>{num(step.value)}</span>
              <Progress value={step.share} size="sm" radius="xl" color="teal" />
              <span className={classes.funnelNote}>{step.note}</span>
            </div>
          ))}
        </div>
      </section>

      <section className={classes.panel}>
        <header className={classes.panelHead}>
          <h3 className={classes.panelTitle}>Needs attention</h3>
        </header>
        <ul className={classes.attention}>
          {attention.map(({ icon: Icon, label, value, tone }) => (
            <li key={label} className={classes.attentionRow}>
              <span className={classes.attentionIcon} data-tone={tone}>
                <Icon size={14} />
              </span>
              <span className={classes.attentionLabel}>{label}</span>
              <span className={classes.attentionValue}>{num(value)}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
