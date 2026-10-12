import { useEffect, useState } from "react";
import { useGetAdminReferralSettingsQuery, useSaveAdminReferralSettingsMutation } from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";
import type { ReferralSettings } from "@/shared/types";

export function useReferralSettingsForm() {
  const { data, isLoading } = useGetAdminReferralSettingsQuery();
  const [save, { isLoading: saving }] = useSaveAdminReferralSettingsMutation();
  const [draft, setDraft] = useState<ReferralSettings | null>(null);

  useEffect(() => {
    if (data) setDraft(data);
  }, [data]);

  const set = <K extends keyof ReferralSettings>(key: K, value: ReferralSettings[K]) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const dirty = Boolean(draft) && JSON.stringify(draft) !== JSON.stringify(data);

  const submit = async () => {
    if (!draft) return;
    try {
      await save(draft).unwrap();
      notify.success("Referral program updated.", "Saved");
    } catch (e) {
      notify.error(errMessage(e, "Could not save the referral settings."));
    }
  };

  return { draft, loading: isLoading || !draft, saving, dirty, set, submit };
}

export type ReferralSettingsForm = ReturnType<typeof useReferralSettingsForm>;
