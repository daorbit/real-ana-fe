import { useEffect, useState } from "react";
import { useSaveAlertsMutation } from "@/features/alerts/api";
import type { AlertChannel, AlertConfig, AlertRule, AlertsOverview, RuleConfig } from "@/features/alerts/types";
import { useDemo } from "@/features/demo/context";
import { notify, notifyError } from "@/shared/lib/notify";
import { useSaveRegistration } from "@/shared/ui/SaveBar";

function sameConfig(a: AlertConfig | null, b: AlertConfig | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useAlertDraft(workspaceId: string | undefined, overview: AlertsOverview | null) {
  const { demo } = useDemo();
  const saved = overview?.config ?? null;
  const [draft, setDraft] = useState<AlertConfig | null>(saved);
  const [save] = useSaveAlertsMutation();

  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  const dirty = Boolean(draft && saved && !sameConfig(draft, saved));

  const setRule = (rule: AlertRule, patch: Partial<RuleConfig>) =>
    setDraft((d) => (d ? { ...d, rules: { ...d.rules, [rule]: { ...d.rules[rule], ...patch } } } : d));

  const setChannel = (channel: AlertChannel, on: boolean) =>
    setDraft((d) => (d ? { ...d, channels: { ...d.channels, [channel]: on } } : d));

  const persist = async () => {
    if (!draft || !workspaceId) return;
    if (demo) {
      notify.error("Demo data is read-only. Turn off demo mode to change alerts.");
      return;
    }
    try {
      await save({ workspaceId, ...draft }).unwrap();
      notify.success("Alert settings saved.", "Alerts");
    } catch (e) {
      notifyError(e, "Could not save alert settings.");
    }
  };

  useSaveRegistration("alerts", { dirty, save: persist, reset: () => setDraft(saved) });

  return { draft, setRule, setChannel };
}
