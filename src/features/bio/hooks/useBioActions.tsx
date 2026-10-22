import { useState } from "react";
import { useDeleteBioPageMutation, useUpdateBioPageMutation } from "@/features/bio/api";
import { BIO_DEMO_MESSAGE, toBioInput } from "@/features/bio/lib/bioDraft";
import { publicBioUrl } from "@/features/bio/lib/bioOptions";
import type { BioPage } from "@/features/bio/types";
import { useDemo } from "@/features/demo/context";
import { confirmDelete, errMessage, notify, notifyError } from "@/shared/lib/notify";

export function useBioActions(workspaceId: string | undefined) {
  const { demo } = useDemo();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [update] = useUpdateBioPageMutation();
  const [remove] = useDeleteBioPageMutation();

  const guard = () => {
    if (!workspaceId) return false;
    if (demo) {
      notify.error(BIO_DEMO_MESSAGE);
      return false;
    }
    return true;
  };

  const togglePublished = async (page: BioPage, published: boolean) => {
    if (!guard() || !workspaceId) return;
    setBusyId(page.id);
    try {
      await update({ workspaceId, id: page.id, ...toBioInput(page), published }).unwrap();
      notify.success(published ? `“${page.title}” is live.` : `“${page.title}” is now a draft.`, "Link in bio");
    } catch (e) {
      notifyError(e, "Could not update the page.");
    } finally {
      setBusyId(null);
    }
  };

  const copyLink = async (page: BioPage) => {
    try {
      await navigator.clipboard.writeText(publicBioUrl(page.slug));
      notify.success("Link copied.");
    } catch {
      notify.error("Could not copy the link.");
    }
  };

  const askDelete = (page: BioPage) => {
    if (!guard() || !workspaceId) return;
    confirmDelete({
      title: "Delete page?",
      body: <>“{page.title}” and its stats will be deleted, and its link will stop working.</>,
      onConfirm: () => {
        setBusyId(page.id);
        remove({ workspaceId, id: page.id })
          .unwrap()
          .catch((e) => notify.error(errMessage(e, "Could not delete the page.")))
          .finally(() => setBusyId(null));
      },
    });
  };

  return { busyId, togglePublished, copyLink, askDelete };
}
