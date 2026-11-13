import { useEffect, useState } from "react";
import { useDemo } from "@/features/demo/context";
import { notify, notifyError } from "@/shared/lib/notify";
import { useSaveRegistration } from "@/shared/ui/SaveBar";
import { useSaveRadarSettingsMutation } from "../api";
import type { DetectorId, DetectorSetting, RadarConfig } from "../types";

function same(a: RadarConfig | null, b: RadarConfig | null): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function useRadarSettingsDraft(workspaceId: string, saved: RadarConfig | null) {
  const { demo } = useDemo();
  const [draft, setDraft] = useState<RadarConfig | null>(saved);
  const [save] = useSaveRadarSettingsMutation();

  useEffect(() => {
    setDraft(saved);
  }, [saved]);

  const dirty = Boolean(draft && saved && !same(draft, saved));

  const setDetector = (id: DetectorId, patch: Partial<DetectorSetting>) =>
    setDraft((d) => (d ? { ...d, detectors: { ...d.detectors, [id]: { ...d.detectors[id], ...patch } } } : d));

  const setFlag = (key: "notifyHighPriority" | "aiExplanations", value: boolean) =>
    setDraft((d) => (d ? { ...d, [key]: value } : d));

  const persist = async () => {
    if (!draft || !workspaceId) return;
    if (demo) {
      notify.error("Demo data is read-only. Turn off demo mode to change settings.");
      return;
    }
    try {
      await save({ workspaceId, config: draft }).unwrap();
      notify.success("Growth Radar settings saved.");
    } catch (e) {
      notifyError(e, "Could not save the settings.");
    }
  };

  useSaveRegistration("growth-radar", { dirty, save: persist, reset: () => setDraft(saved) });

  return { draft, setDetector, setFlag };
}
