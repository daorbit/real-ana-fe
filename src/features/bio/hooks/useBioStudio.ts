import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateBioPageMutation, useUpdateBioPageMutation } from "@/features/bio/api";
import { useBioPages } from "@/features/bio/hooks/useBioPages";
import { BIO_DEMO_MESSAGE, bioDraftProblem, toBioInput } from "@/features/bio/lib/bioDraft";
import { emptyBioPage, newLinkId } from "@/features/bio/lib/bioOptions";
import type { BioLink, BioPageInput, BioSocial, BioTheme } from "@/features/bio/types";
import { useDemo } from "@/features/demo/context";
import { notify, notifyError } from "@/shared/lib/notify";

export function useBioStudio(workspaceId: string | undefined, workspaceName: string, pageId: string | undefined) {
  const navigate = useNavigate();
  const { demo } = useDemo();
  const { pages, loading } = useBioPages(workspaceId);
  const isNew = !pageId;
  const existing = pageId ? pages.find((p) => p.id === pageId) ?? null : null;

  const [draft, setDraft] = useState<BioPageInput>(() => emptyBioPage(workspaceName));
  const [saved, setSaved] = useState<BioPageInput | null>(null);
  const [create, { isLoading: creating }] = useCreateBioPageMutation();
  const [update, { isLoading: updating }] = useUpdateBioPageMutation();

  useEffect(() => {
    if (!existing || saved) return;
    const input = toBioInput(existing);
    setDraft(input);
    setSaved(input);
  }, [existing, saved]);

  const set = (patch: Partial<BioPageInput>) => setDraft((d) => ({ ...d, ...patch }));
  const setTheme = (patch: Partial<BioTheme>) => setDraft((d) => ({ ...d, theme: { ...d.theme, ...patch } }));

  const addLink = () =>
    setDraft((d) => ({ ...d, links: [...d.links, { id: newLinkId(), label: "", url: "", enabled: true }] }));
  const updateLink = (id: string, patch: Partial<BioLink>) =>
    setDraft((d) => ({ ...d, links: d.links.map((link) => (link.id === id ? { ...link, ...patch } : link)) }));
  const removeLink = (id: string) => setDraft((d) => ({ ...d, links: d.links.filter((link) => link.id !== id) }));
  const moveLink = (id: string, offset: -1 | 1) =>
    setDraft((d) => {
      const from = d.links.findIndex((link) => link.id === id);
      const to = from + offset;
      if (from < 0 || to < 0 || to >= d.links.length) return d;
      const links = [...d.links];
      [links[from], links[to]] = [links[to], links[from]];
      return { ...d, links };
    });

  const setSocials = (socials: BioSocial[]) => setDraft((d) => ({ ...d, socials }));

  const problem = bioDraftProblem(draft);
  const dirty = isNew || JSON.stringify(draft) !== JSON.stringify(saved);

  const save = async () => {
    if (!workspaceId) return;
    if (problem) {
      notify.error(problem);
      return;
    }
    if (demo) {
      notify.error(BIO_DEMO_MESSAGE);
      return;
    }
    try {
      if (isNew) {
        await create({ workspaceId, ...draft }).unwrap();
        notify.success(draft.published ? "Your page is live." : "Page saved as a draft.", "Link in bio");
        navigate("/app/bio");
        return;
      }
      const result = await update({ workspaceId, id: pageId!, ...draft }).unwrap();
      const next = toBioInput(result);
      setDraft(next);
      setSaved(next);
      notify.success("Saved. Visitors see the change within a minute.", "Link in bio");
    } catch (e) {
      notifyError(e, "Could not save the page.");
    }
  };

  return {
    draft,
    set,
    setTheme,
    addLink,
    updateLink,
    removeLink,
    moveLink,
    setSocials,
    problem,
    dirty,
    save,
    saving: creating || updating,
    isNew,
    loading: !isNew && loading,
    notFound: !isNew && !loading && !existing,
    stats: existing?.stats ?? null,
  };
}
