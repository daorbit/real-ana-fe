import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreatePopupMutation, useUpdatePopupMutation } from "@/features/popups/api";
import { usePopups } from "@/features/popups/hooks/usePopups";
import { POPUP_DEMO_MESSAGE, defaultPopup, isPopupValid, toInput } from "@/features/popups/lib/popupOptions";
import type { PopupInput } from "@/features/popups/types";
import { useDemo } from "@/features/demo/context";
import { useSites } from "@/features/workspace";
import { notify, notifyError } from "@/shared/lib/notify";

export function usePopupStudio(workspaceId: string | undefined, popupId: string | undefined) {
  const navigate = useNavigate();
  const { demo } = useDemo();
  const { popups, loading } = usePopups(workspaceId);
  const { sites } = useSites(workspaceId);
  const isNew = !popupId;
  const existing = popupId ? popups.find((p) => p.id === popupId) ?? null : null;
  const firstSiteId = sites[0]?.siteId ?? "";

  const [draft, setDraft] = useState<PopupInput>(() => defaultPopup(firstSiteId));
  const [saved, setSaved] = useState<PopupInput | null>(null);
  const [create, { isLoading: creating }] = useCreatePopupMutation();
  const [update, { isLoading: updating }] = useUpdatePopupMutation();

  useEffect(() => {
    if (!existing || saved) return;
    const input = toInput(existing);
    setDraft(input);
    setSaved(input);
  }, [existing, saved]);

  useEffect(() => {
    if (isNew && firstSiteId) setDraft((d) => (d.siteId ? d : { ...d, siteId: firstSiteId }));
  }, [isNew, firstSiteId]);

  const set = (patch: Partial<PopupInput>) => setDraft((d) => ({ ...d, ...patch }));
  const setTrigger = (patch: Partial<PopupInput["trigger"]>) => setDraft((d) => ({ ...d, trigger: { ...d.trigger, ...patch } }));
  const setPages = (patch: Partial<PopupInput["pages"]>) => setDraft((d) => ({ ...d, pages: { ...d.pages, ...patch } }));

  const valid = isPopupValid(draft);
  const dirty = isNew || JSON.stringify(draft) !== JSON.stringify(saved);

  const save = async () => {
    if (!workspaceId || !valid) return;
    if (demo) {
      notify.error(POPUP_DEMO_MESSAGE);
      return;
    }
    const input = { ...draft, name: draft.name.trim() };
    try {
      if (isNew) {
        await create({ workspaceId, ...input }).unwrap();
        notify.success(
          input.enabled ? "Popup published. It reaches your site within 5 minutes." : "Popup saved as paused.",
          "Popups",
        );
        navigate("/app/popups");
        return;
      }
      const result = await update({ workspaceId, id: popupId!, ...input }).unwrap();
      const next = toInput(result);
      setDraft(next);
      setSaved(next);
      notify.success("Saved. Your site picks up the change within 5 minutes.", "Popups");
    } catch (e) {
      notifyError(e, "Could not save the popup.");
    }
  };

  return {
    draft,
    set,
    setTrigger,
    setPages,
    valid,
    dirty,
    save,
    saving: creating || updating,
    isNew,
    loading: !isNew && loading,
    notFound: !isNew && !loading && !existing,
    sites,
  };
}
