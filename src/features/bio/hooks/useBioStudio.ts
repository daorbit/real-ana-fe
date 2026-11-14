import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useBioMutations } from "@/features/bio/hooks/useBioMutations";
import { useBioPages } from "@/features/bio/hooks/useBioPages";
import { BIO_DEMO_MESSAGE, bioDraftProblem, toBioInput } from "@/features/bio/lib/bioDraft";
import { emptyBioPage, emptyRelease, newRowId } from "@/features/bio/lib/bioOptions";
import { patchById, removeById, reorder } from "@/features/bio/lib/listOps";
import type { BioLink, BioPageInput, BioRelease, BioServiceRow, BioSocial, BioTheme } from "@/features/bio/types";
import { draftFromTemplate } from "@/features/bio/templates/bioTemplates";
import type { BioTemplate } from "@/features/bio/templates/templateTypes";
import { useDemo } from "@/features/demo/context";
import { notify, notifyError } from "@/shared/lib/notify";

const TOAST_TITLE = "Link-in-bio";

export function useBioStudio(
  workspaceId: string | undefined,
  workspaceName: string,
  pageId: string | undefined,
  template: BioTemplate | null,
) {
  const navigate = useNavigate();
  const { demo } = useDemo();
  const { pages, loading } = useBioPages(workspaceId);
  const isNew = !pageId;
  const existing = pageId ? pages.find((p) => p.id === pageId) ?? null : null;

  const [draft, setDraft] = useState<BioPageInput>(() =>
    template ? draftFromTemplate(template, workspaceName) : emptyBioPage("profile", workspaceName),
  );
  const [saved, setSaved] = useState<BioPageInput | null>(null);
  const mutations = useBioMutations(workspaceId);

  useEffect(() => {
    if (!existing || saved) return;
    const input = toBioInput(existing);
    setDraft(input);
    setSaved(input);
  }, [existing, saved]);

  const set = (patch: Partial<BioPageInput>) => setDraft((d) => ({ ...d, ...patch }));
  const setTheme = (patch: Partial<BioTheme>) => setDraft((d) => ({ ...d, theme: { ...d.theme, ...patch } }));

  const addLink = (patch: Partial<BioLink> = {}): string => {
    const id = newRowId();
    setDraft((d) => ({ ...d, links: [...d.links, { id, label: "", url: "", enabled: true, ...patch }] }));
    return id;
  };
  const updateLink = (id: string, patch: Partial<BioLink>) => setDraft((d) => ({ ...d, links: patchById(d.links, id, patch) }));
  const removeLink = (id: string) => setDraft((d) => ({ ...d, links: removeById(d.links, id) }));
  const reorderLinks = (from: number, to: number) => setDraft((d) => ({ ...d, links: reorder(d.links, from, to) }));

  const setSocials = (socials: BioSocial[]) => setDraft((d) => ({ ...d, socials }));

  const withRelease = (fn: (release: BioRelease) => BioRelease) =>
    setDraft((d) => ({ ...d, release: fn(d.release ?? emptyRelease()) }));
  const setRelease = (patch: Partial<BioRelease>) => withRelease((r) => ({ ...r, ...patch }));
  const addRows = (rows: BioServiceRow[]) => withRelease((r) => ({ ...r, rows: [...r.rows, ...rows] }));
  const updateRow = (id: string, patch: Partial<BioServiceRow>) => withRelease((r) => ({ ...r, rows: patchById(r.rows, id, patch) }));
  const removeRow = (id: string) => withRelease((r) => ({ ...r, rows: removeById(r.rows, id) }));
  const reorderRows = (from: number, to: number) => withRelease((r) => ({ ...r, rows: reorder(r.rows, from, to) }));

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
        await mutations.create(draft);
        notify.success(draft.published ? "Your page is live." : "Page saved as a draft.", TOAST_TITLE);
        navigate("/app/bio");
        return;
      }
      const result = await mutations.update(pageId!, draft);
      const next = toBioInput(result);
      setDraft(next);
      setSaved(next);
      notify.success("Saved. Visitors see the change within a minute.", TOAST_TITLE);
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
    reorderLinks,
    setSocials,
    setRelease,
    addRows,
    updateRow,
    removeRow,
    reorderRows,
    problem,
    dirty,
    save,
    saving: mutations.pending,
    isNew,
    loading: !isNew && loading,
    notFound: !isNew && !loading && !existing,
    stats: existing?.stats ?? null,
  };
}

export type BioStudioState = ReturnType<typeof useBioStudio>;
