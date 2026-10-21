import { useState } from "react";
import { useGetSeoSharePanelsQuery, useSetSeoSharePanelsMutation } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { useDemo } from "@/features/demo/context";
import { trace } from "@/shared/lib/analytics";
import { notify, errMessage } from "@/shared/lib/notify";
import { useSaveRegistration } from "@/shared/ui/SaveBar";
import type { SeoSharePanels } from "@/shared/types";
import { SEO_ALL_PANELS, SEO_DEFAULT_PANELS } from "./seoPanels";

export function useSeoSharePanels(workspaceId: string) {
  const { user } = useAuth();
  const { demo } = useDemo();
  const { data, isLoading } = useGetSeoSharePanelsQuery(workspaceId);
  const [savePanels] = useSetSeoSharePanelsMutation();
  const [draft, setDraft] = useState<SeoSharePanels | null>(null);

  const serverPanels = { ...SEO_DEFAULT_PANELS, ...(data?.panels ?? {}) };
  const panels = draft ?? serverPanels;
  const dirty = draft !== null && SEO_ALL_PANELS.some((p) => draft[p.key] !== serverPanels[p.key]);

  const save = async () => {
    if (!draft) return;
    if (demo) {
      notify.error("Turn off demo data to change what's shared.");
      return;
    }
    trace(user?.id, "save_seo_share_panels", "seo_share", "seo_share");
    try {
      await savePanels({ workspaceId, panels: draft }).unwrap();
      setDraft(null);
      notify.success("What readers see has been updated.");
    } catch (e) {
      notify.error(errMessage(e, "Could not update what is shared."));
    }
  };

  useSaveRegistration("seo-share-panels", { dirty, save, reset: () => setDraft(null) });

  return {
    loading: isLoading,
    panels,
    onCount: SEO_ALL_PANELS.filter((p) => panels[p.key]).length,
    setPanel: (key: keyof SeoSharePanels, next: boolean) => setDraft({ ...panels, [key]: next }),
    setAll: (next: boolean) =>
      setDraft(Object.fromEntries(SEO_ALL_PANELS.map((p) => [p.key, next])) as SeoSharePanels),
  };
}
