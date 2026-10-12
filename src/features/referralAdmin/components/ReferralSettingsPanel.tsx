import { Button, Center, Group, Loader, NumberInput, SegmentedControl, Stack, Switch } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { Save } from "lucide-react";
import { Field, Section } from "@/shared/ui/Page";
import type { ReferralQualifyOn } from "@/shared/types";
import { useReferralSettingsForm } from "../hooks/useReferralSettingsForm";
import { ReferralSettingsMobile } from "./mobile/ReferralSettingsMobile";

export function ReferralSettingsPanel() {
  const mobile = useMediaQuery("(max-width: 48em)") ?? false;
  const form = useReferralSettingsForm();
  const { draft, loading, saving, dirty, set, submit } = form;

  if (loading || !draft) {
    return <Center py="xl"><Loader size="sm" /></Center>;
  }

  if (mobile) return <ReferralSettingsMobile form={form} draft={draft} />;

  return (
    <Stack gap="xl">
      <Section title="Program" description="Who can refer, and when a referral counts.">
        <Field label="Referral program" hint="When off, no new referrals are recorded and users see the program as paused.">
          <Switch
            checked={draft.enabled}
            onChange={(e) => set("enabled", e.currentTarget.checked)}
            label={draft.enabled ? "On" : "Off"}
          />
        </Field>
        <Field
          label="Reward when"
          hint="Signup rewards the referrer as soon as the friend's account exists. First payment waits until the friend buys a plan or addon."
          last
        >
          <SegmentedControl
            fullWidth
            value={draft.qualifyOn}
            onChange={(v) => set("qualifyOn", v as ReferralQualifyOn)}
            data={[
              { label: "Signup", value: "signup" },
              { label: "First payment", value: "first_payment" },
            ]}
          />
        </Field>
      </Section>

      <Section title="Referrer reward" description="Each qualified referral creates a single-use coupon locked to the referrer's account.">
        <Field label="Discount" hint="Percent off the referrer's next plan or addon purchase.">
          <NumberInput
            value={draft.rewardPercentOff}
            onChange={(v) => set("rewardPercentOff", Number(v) || 1)}
            min={1}
            max={100}
            suffix="%"
          />
        </Field>
        <Field label="Valid for" hint="Days from when the coupon is issued until it expires.">
          <NumberInput
            value={draft.rewardValidDays}
            onChange={(v) => set("rewardValidDays", Number(v) || 1)}
            min={1}
            max={3650}
            suffix=" days"
          />
        </Field>
        <Field label="Rewards per referrer" hint="0 means no limit. Referrals past the cap stay pending, so you can still reward them by hand." last>
          <NumberInput
            value={draft.maxRewardsPerUser}
            onChange={(v) => set("maxRewardsPerUser", Math.max(0, Number(v) || 0))}
            min={0}
            max={10000}
          />
        </Field>
      </Section>

      <Group justify="flex-end">
        <Button leftSection={<Save size={15} />} onClick={submit} loading={saving} disabled={!dirty}>
          Save changes
        </Button>
      </Group>
    </Stack>
  );
}
