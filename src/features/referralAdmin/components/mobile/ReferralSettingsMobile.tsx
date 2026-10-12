import { Button, NumberInput, SegmentedControl, Switch } from "@mantine/core";
import { InsetList, InsetRow } from "@/shared/ui/InsetList";
import type { ReferralQualifyOn, ReferralSettings } from "@/shared/types";
import type { ReferralSettingsForm } from "../../hooks/useReferralSettingsForm";
import classes from "./ReferralMobile.module.css";

export function ReferralSettingsMobile({ form, draft }: { form: ReferralSettingsForm; draft: ReferralSettings }) {
  const { set, submit, saving, dirty } = form;

  return (
    <div className={classes.stack}>
      <InsetList
        header="Program"
        footer="Signup rewards the referrer as soon as the friend's account exists. First payment waits until they buy a plan or addon."
      >
        <InsetRow
          title="Referral program"
          subtitle={draft.enabled ? "Recording new referrals" : "Paused for everyone"}
          trailing={
            <Switch
              checked={draft.enabled}
              onChange={(e) => set("enabled", e.currentTarget.checked)}
              aria-label="Referral program"
            />
          }
        />
        <InsetRow
          title="Reward when"
          trailing={
            <SegmentedControl
              size="xs"
              radius="md"
              value={draft.qualifyOn}
              onChange={(v) => set("qualifyOn", v as ReferralQualifyOn)}
              data={[
                { label: "Signup", value: "signup" },
                { label: "Payment", value: "first_payment" },
              ]}
            />
          }
        />
      </InsetList>

      <InsetList
        header="Referrer reward"
        footer="Each qualified referral creates a single-use coupon locked to the referrer. 0 rewards per referrer means no limit."
      >
        <InsetRow
          title="Discount"
          trailing={
            <NumberInput
              className={classes.rowInput}
              value={draft.rewardPercentOff}
              onChange={(v) => set("rewardPercentOff", Number(v) || 1)}
              min={1}
              max={100}
              suffix="%"
              hideControls
              aria-label="Discount"
            />
          }
        />
        <InsetRow
          title="Valid for"
          trailing={
            <NumberInput
              className={classes.rowInput}
              value={draft.rewardValidDays}
              onChange={(v) => set("rewardValidDays", Number(v) || 1)}
              min={1}
              max={3650}
              suffix=" days"
              hideControls
              aria-label="Valid for"
            />
          }
        />
        <InsetRow
          title="Rewards per referrer"
          trailing={
            <NumberInput
              className={classes.rowInput}
              value={draft.maxRewardsPerUser}
              onChange={(v) => set("maxRewardsPerUser", Math.max(0, Number(v) || 0))}
              min={0}
              max={10000}
              hideControls
              aria-label="Rewards per referrer"
            />
          }
        />
      </InsetList>

      <Button size="md" radius="md" fullWidth onClick={submit} loading={saving} disabled={!dirty}>
        Save changes
      </Button>
    </div>
  );
}
