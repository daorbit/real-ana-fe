import { useCallback, useEffect, useRef, useState } from "react";
import { notifyError } from "@/shared/lib/notify";
import { useUpdateCampaignMutation } from "@/features/campaigns/api";
import { useCampaignDetail } from "@/features/campaigns/hooks/useCampaignDetail";
import type { Campaign, CampaignInput, EmailBlock, EmailBlockType, EmailTheme } from "@/features/campaigns/types";
import { blockId, newBlock } from "@/features/campaigns/lib/emailDesign";

const AUTOSAVE_MS = 1_500;

function draftFrom(campaign: Campaign): CampaignInput {
  return {
    name: campaign.name,
    subject: campaign.subject,
    preheader: campaign.preheader,
    mode: campaign.mode,
    design: campaign.design,
    html: campaign.html,
    senderAddress: campaign.senderAddress,
    formIds: campaign.formIds,
    imported: campaign.imported ?? [],
  };
}

export function useCampaignEditor(workspaceId: string | undefined, campaignId: string | undefined) {
  const detail = useCampaignDetail(workspaceId, campaignId);
  const [draft, setDraft] = useState<CampaignInput | null>(null);
  const [dirty, setDirty] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [update, updateState] = useUpdateCampaignMutation();
  const loadedId = useRef<string | null>(null);
  const latest = useRef<CampaignInput | null>(null);
  latest.current = draft;
  const loaded = detail.campaign;

  useEffect(() => {
    if (!loaded || loadedId.current === loaded.id) return;
    loadedId.current = loaded.id;
    setDraft(draftFrom(loaded));
  }, [loaded]);

  const change = useCallback((updater: (current: CampaignInput) => CampaignInput) => {
    setDraft((current) => (current ? updater(current) : current));
    setDirty(true);
  }, []);

  const set = useCallback(
    <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => change((current) => ({ ...current, [key]: value })),
    [change],
  );

  const setBlocks = useCallback(
    (updater: (blocks: EmailBlock[]) => EmailBlock[]) =>
      change((current) => ({ ...current, design: { ...current.design, blocks: updater(current.design.blocks) } })),
    [change],
  );

  const setTheme = useCallback(
    (patch: Partial<EmailTheme>) =>
      change((current) => ({ ...current, design: { ...current.design, theme: { ...current.design.theme, ...patch } } })),
    [change],
  );

  const updateBlock = useCallback(
    (id: string, patch: Partial<EmailBlock>) =>
      setBlocks((blocks) => blocks.map((block) => (block.id === id ? ({ ...block, ...patch } as EmailBlock) : block))),
    [setBlocks],
  );

  const addBlock = useCallback(
    (type: EmailBlockType) => {
      const block = newBlock(type);
      setBlocks((blocks) => [...blocks, block]);
      setExpandedId(block.id);
    },
    [setBlocks],
  );

  const removeBlock = useCallback(
    (id: string) => setBlocks((blocks) => blocks.filter((block) => block.id !== id)),
    [setBlocks],
  );

  const duplicateBlock = useCallback(
    (id: string) =>
      setBlocks((blocks) =>
        blocks.flatMap((block) => (block.id === id ? [block, { ...block, id: blockId() } as EmailBlock] : [block])),
      ),
    [setBlocks],
  );

  const save = useCallback(async (): Promise<boolean> => {
    const current = latest.current;
    if (!workspaceId || !campaignId || !current) return false;
    try {
      await update({ workspaceId, id: campaignId, ...current }).unwrap();
      if (latest.current === current) setDirty(false);
      return true;
    } catch (e) {
      notifyError(e, "Could not save the campaign.");
      return false;
    }
  }, [workspaceId, campaignId, update]);

  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => void save(), AUTOSAVE_MS);
    return () => window.clearTimeout(timer);
  }, [dirty, draft, save]);

  return {
    draft,
    set,
    setBlocks,
    setTheme,
    updateBlock,
    addBlock,
    removeBlock,
    duplicateBlock,
    expandedId,
    setExpandedId,
    save,
    saving: updateState.isLoading,
    dirty,
    loading: detail.loading || (!draft && !detail.notFound),
    notFound: detail.notFound,
    locked: Boolean(loaded) && loaded?.status !== "draft",
  };
}
