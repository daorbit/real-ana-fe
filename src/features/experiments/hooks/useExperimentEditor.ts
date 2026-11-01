import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDemo } from "@/features/demo/context";
import { useSites } from "@/features/workspace";
import { notify, notifyError } from "@/shared/lib/notify";
import { useCreateExperimentMutation, useUpdateExperimentMutation } from "@/features/experiments/api";
import { useExperimentDetail } from "@/features/experiments/hooks/useExperimentDetail";
import { draftFrom, draftProblem, emptyDraft, withVariantCount } from "@/features/experiments/lib/experimentDraft";
import type { ExperimentChange, ExperimentInput, ExperimentVariant } from "@/features/experiments/types";

export function useExperimentEditor(workspaceId: string | undefined, id: string | undefined) {
  const { demo } = useDemo();
  const navigate = useNavigate();
  const { sites } = useSites(workspaceId);
  const isNew = !id;
  const existing = useExperimentDetail(workspaceId, id);
  const [draft, setDraft] = useState<ExperimentInput>(() => emptyDraft(""));
  const [loaded, setLoaded] = useState(isNew);
  const [create, creating] = useCreateExperimentMutation();
  const [update, updating] = useUpdateExperimentMutation();

  const source = existing.detail?.experiment;
  useEffect(() => {
    if (!isNew && source && !loaded) {
      setDraft(draftFrom(source));
      setLoaded(true);
    }
  }, [isNew, loaded, source]);

  const firstSite = sites[0]?.siteId ?? "";
  useEffect(() => {
    if (isNew && !draft.siteId && firstSite) setDraft((d) => ({ ...d, siteId: firstSite }));
  }, [draft.siteId, firstSite, isNew]);

  const set = (patch: Partial<ExperimentInput>) => setDraft((d) => ({ ...d, ...patch }));

  const setVariant = (index: number, patch: Partial<ExperimentVariant>) =>
    setDraft((d) => ({ ...d, variants: d.variants.map((v, i) => (i === index ? { ...v, ...patch } : v)) }));

  const setChange = (index: number, changeIndex: number, patch: Partial<ExperimentChange>) =>
    setDraft((d) => ({
      ...d,
      variants: d.variants.map((v, i) =>
        i === index ? { ...v, changes: v.changes.map((c, j) => (j === changeIndex ? { ...c, ...patch } : c)) } : v,
      ),
    }));

  const addChange = (index: number) =>
    setVariant(index, { changes: [...draft.variants[index].changes, { selector: "", action: "text", attr: "", value: "" }] });

  const removeChange = (index: number, changeIndex: number) =>
    setVariant(index, { changes: draft.variants[index].changes.filter((_, j) => j !== changeIndex) });

  const setVariantCount = (count: number) => setDraft((d) => ({ ...d, variants: withVariantCount(d.variants, count) }));

  const problem = useMemo(() => draftProblem(draft), [draft]);
  const locked = Boolean(source && (source.status === "running" || source.status === "ended"));

  const save = async () => {
    if (demo) {
      notify.error("Demo data is read-only. Turn off demo mode to create tests.");
      return;
    }
    if (!workspaceId || problem) {
      if (problem) notify.error(problem);
      return;
    }
    try {
      const saved = isNew
        ? await create({ workspaceId, ...draft }).unwrap()
        : await update({ workspaceId, id: id!, ...draft }).unwrap();
      notify.success(isNew ? "Test saved as a draft." : "Changes saved.");
      navigate(`/app/experiments/${saved.id}`);
    } catch (e) {
      notifyError(e);
    }
  };

  return {
    draft,
    sites,
    isNew,
    loading: !isNew && (existing.loading || !loaded),
    notFound: !isNew && existing.failed,
    locked,
    problem,
    saving: creating.isLoading || updating.isLoading,
    set,
    setVariant,
    setChange,
    addChange,
    removeChange,
    setVariantCount,
    save,
  };
}
