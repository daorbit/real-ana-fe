import { useEffect, useState } from "react";
import { Button, Center, Group, Loader, NumberInput, SegmentedControl, Stack, Switch } from "@mantine/core";
import { Save } from "lucide-react";
import { useGetAdminReferralSettingsQuery, useSaveAdminReferralSettingsMutation } from "@/app/store";
import { Field, Section } from "@/shared/ui/Page";
import { notify, errMessage } from "@/shared/lib/notify";
import type { ReferralQualifyOn, ReferralSettings } from "@/shared/types";

export function ReferralSettingsPanel() {
  const { data, isLoading } = useGetAdminReferralSettingsQuery();
  const [save, { isLoading: saving }] = useSaveAdminReferralSettingsMutation();
  const [draft, setDraft] = useState<ReferralSettings | null>(null);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  if (isLoading || !draft) {
    return <Center py="xl"><Loader size="sm" /></Center>;
  }

  const set = <K extends keyof ReferralSettings>(key: K, value: ReferralSettings[K]) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const dirty = JSON.stringify(draft) !== JSON.stringify(data);

  const submit = async () => {
    try {
      await save(draft).unwrap();
      notify.success("Referral program updated.", "Saved");
    } catch (e) {
      notify.error(errMessage(e, "Could not save the referral settings."));
    }
  };

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
