import { Clock, Flag, KeyRound, Ticket } from "lucide-react";
import { num } from "@/shared/lib";
import { InsetList, InsetRow, RowIcon } from "@/shared/ui/InsetList";
import type { ReferralOverview } from "@/shared/types";
import { StatTile, StatTileGrid } from "@/shared/ui/StatTile";
import classes from "./ReferralMobile.module.css";

function pct(part: number, whole: number) {
  return whole > 0 ? Math.round((part / whole) * 100) : 0;
}

export function ReferralOverviewMobile({ data }: { data: ReferralOverview }) {
  return (
    <div className={classes.stack}>
      <StatTileGrid>
        <StatTile label="Signups" value={num(data.total)} note="with a link" />
        <StatTile label="Rewarded" value={num(data.rewarded)} note={`${pct(data.rewarded, data.total)}% of signups`} />
        <StatTile
          label="Coupons used"
          value={num(data.couponsRedeemed)}
          note={`${pct(data.couponsRedeemed, data.rewarded + data.revoked)}% of issued`}
        />
      </StatTileGrid>

      <InsetList
        header="Needs attention"
        footer={`${num(data.rejected)} rejected · ${num(data.revoked)} revoked`}
      >
        <InsetRow
          leading={<RowIcon tone="orange"><Clock size={15} /></RowIcon>}
          title="Waiting for review"
          trailing={num(data.pending)}
        />
        <InsetRow
          leading={<RowIcon tone="red"><Flag size={15} /></RowIcon>}
          title="Flagged as same network"
          trailing={num(data.flagged)}
        />
        <InsetRow
          leading={<RowIcon tone="blue"><Ticket size={15} /></RowIcon>}
          title="Coupons not used yet"
          trailing={num(data.couponsReady)}
        />
        <InsetRow
          leading={<RowIcon tone="gray"><KeyRound size={15} /></RowIcon>}
          title="Referral codes created"
          trailing={num(data.codes)}
        />
      </InsetList>
    </div>
  );
}
