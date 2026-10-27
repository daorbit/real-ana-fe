import { useEffect, useState } from "react";
import { useGetInvoicingProfileQuery, useSaveInvoicingProfileMutation } from "@/app/store/api";
import { notify, notifyError } from "@/shared/lib/notify";
import { useSaveRegistration } from "@/shared/ui/SaveBar";
import type { InvoicingProfile } from "../types";

function sameProfile(a: InvoicingProfile | null, b: InvoicingProfile | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useInvoicingProfileDraft(workspaceId: string) {
  const { currentData, isLoading, isError } = useGetInvoicingProfileQuery(workspaceId);
  const saved = currentData?.profile ?? null;
  const [draft, setDraft] = useState<InvoicingProfile | null>(saved);
  const [save] = useSaveInvoicingProfileMutation();

  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  const dirty = Boolean(draft && saved && !sameProfile(draft, saved));

  const setField = <K extends keyof InvoicingProfile>(field: K, value: InvoicingProfile[K]) =>
    setDraft((d) => (d ? { ...d, [field]: value } : d));

  const persist = async () => {
    if (!draft) return;
    try {
      await save({ workspaceId, profile: draft }).unwrap();
      notify.success("Business details saved.", "Invoicing");
    } catch (e) {
      notifyError(e, "Could not save business details.");
    }
  };

  useSaveRegistration("invoicing-profile", { dirty, save: persist, reset: () => setDraft(saved) });

  return { draft, setField, complete: currentData?.complete ?? false, loading: isLoading, failed: isError };
}
