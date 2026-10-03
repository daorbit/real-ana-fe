import { useState } from "react";
import { notify, notifyError, confirmDelete } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import { useAuth } from "@/features/auth/context";
import {
  useAddBacklinkMutation, useCheckBacklinkPageMutation, useDeleteBacklinkMutation, useDiscoverBacklinksMutation,
  useRecheckBacklinkMutation, useRecheckBacklinksMutation, useSyncBacklinkIndexMutation,
} from "../api";
import type { PageCheckResult } from "../types";

export function useBacklinkActions(workspaceId: string, siteId: string) {
  const { user } = useAuth();
  const args = { workspaceId, siteId };
  const [discover, { isLoading: discovering }] = useDiscoverBacklinksMutation();
  const [recheckAll, { isLoading: recheckingAll }] = useRecheckBacklinksMutation();
  const [recheckOne] = useRecheckBacklinkMutation();
  const [addLink, { isLoading: adding }] = useAddBacklinkMutation();
  const [checkPageMutation, { isLoading: checkingPage }] = useCheckBacklinkPageMutation();
  const [syncIndex, { isLoading: syncingIndex }] = useSyncBacklinkIndexMutation();
  const [deleteLink] = useDeleteBacklinkMutation();
  const [recheckingId, setRecheckingId] = useState<string | null>(null);
  const [pageResult, setPageResult] = useState<PageCheckResult | null>(null);

  const findNew = async () => {
    trace(user?.id, "discover_backlinks", "backlinks", "backlinks_discovered");
    try {
      const r = await discover(args).unwrap();
      const more = r.remaining > 0 ? ` ${r.remaining} more are queued for the next run.` : "";
      notify.success(
        r.discovered === 0
          ? "No external referrers in the last 90 days yet. Links appear here once visitors arrive from them."
          : `${r.added} new referring pages found, ${r.verified.checked} checked, ${r.verified.live} confirmed live.${more}`,
        "Backlinks updated",
      );
    } catch (e) {
      notifyError(e, "Could not look for backlinks");
    }
  };

  const recheckEverything = async () => {
    trace(user?.id, "recheck_backlinks", "backlinks", "backlinks_rechecked");
    try {
      const r = await recheckAll(args).unwrap();
      notify.success(
        `${r.checked} re-checked: ${r.live} live, ${r.lost} lost.${r.remaining > 0 ? " Run again to check the rest." : ""}`,
        "Backlinks re-checked",
      );
    } catch (e) {
      notifyError(e, "Re-check failed");
    }
  };

  const recheck = async (backlinkId: string) => {
    setRecheckingId(backlinkId);
    try {
      await recheckOne({ ...args, backlinkId }).unwrap();
    } catch (e) {
      notifyError(e, "Re-check failed");
    } finally {
      setRecheckingId(null);
    }
  };

  const add = async (url: string): Promise<boolean> => {
    trace(user?.id, "add_backlink", "backlinks", "backlink_added");
    try {
      const doc = await addLink({ ...args, url: url.trim() }).unwrap();
      if (doc.status === "live") notify.success("The link is live and now tracked.", "Backlink added");
      else notify.info("Tracked, but no link to your site was found on that page yet.", "Backlink added");
      return true;
    } catch (e) {
      notifyError(e, "Could not add backlink");
      return false;
    }
  };

  const checkPage = async (url: string): Promise<boolean> => {
    trace(user?.id, "check_backlink_page", "backlinks", "backlink_page_checked");
    try {
      setPageResult(await checkPageMutation({ ...args, url: url.trim() }).unwrap());
      return true;
    } catch (e) {
      notifyError(e, "Could not check that page");
      return false;
    }
  };

  const importFromIndex = async () => {
    trace(user?.id, "sync_backlink_index", "backlinks", "backlink_index_synced");
    try {
      const r = await syncIndex(args).unwrap();
      const theirs = r.competitors.reduce((sum, c) => sum + c.links, 0);
      const failed = r.competitors.filter((c) => c.error).length;
      notify.success(
        `${r.mine} of your referring domains and ${theirs} across competitors.${failed ? ` ${failed} competitor lookups failed.` : ""}`,
        "Imported from backlink index",
      );
    } catch (e) {
      notifyError(e, "Index import failed");
    }
  };

  const remove = (backlinkId: string, domain: string) => {
    confirmDelete({
      title: "Stop tracking backlink",
      body: `Stop tracking the link from ${domain}? It will reappear if visitors keep arriving from it.`,
      onConfirm: async () => {
        try {
          await deleteLink({ ...args, backlinkId }).unwrap();
        } catch (e) {
          notifyError(e, "Could not remove backlink");
        }
      },
    });
  };

  return {
    findNew, discovering,
    recheckEverything, recheckingAll,
    recheck, recheckingId,
    add, adding,
    checkPage, checkingPage, pageResult, clearPageResult: () => setPageResult(null),
    importFromIndex, syncingIndex,
    remove,
  };
}
