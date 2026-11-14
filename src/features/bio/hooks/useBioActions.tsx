import { useState } from "react";
import { useBioMutations } from "@/features/bio/hooks/useBioMutations";
import { BIO_DEMO_MESSAGE, toBioInput } from "@/features/bio/lib/bioDraft";
import { publicBioUrl } from "@/features/bio/lib/bioOptions";
import { copyText } from "@/features/bio/lib/copyText";
import type { BioPage } from "@/features/bio/types";
import { useDemo } from "@/features/demo/context";
import { confirmDelete, errMessage, notify, notifyError } from "@/shared/lib/notify";

export function useBioActions(workspaceId: string | undefined) {
  const { demo } = useDemo();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [qrPage, setQrPage] = useState<BioPage | null>(null);
  const mutations = useBioMutations(workspaceId);

  const guard = () => {
    if (!workspaceId) return false;
    if (demo) {
      notify.error(BIO_DEMO_MESSAGE);
      return false;
    }
    return true;
  };

  const togglePublished = async (page: BioPage, published: boolean) => {
    if (!guard()) return;
    setBusyId(page.id);
    try {
      await mutations.update(page.id, { ...toBioInput(page), published });
      notify.success(published ? `“${page.title}” is live.` : `“${page.title}” is now a draft.`, "Link-in-bio");
    } catch (e) {
      notifyError(e, "Could not update the page.");
    } finally {
      setBusyId(null);
    }
  };

  const copyLink = (page: BioPage) => copyText(publicBioUrl(page.slug));

  const askDelete = (page: BioPage) => {
    if (!guard()) return;
    confirmDelete({
      title: "Delete page?",
      body: <>“{page.title}” and its stats will be deleted, and its link will stop working.</>,
      onConfirm: () => {
        setBusyId(page.id);
        mutations
          .remove(page.id)
          .catch((e) => notify.error(errMessage(e, "Could not delete the page.")))
          .finally(() => setBusyId(null));
      },
    });
  };

  return {
    busyId,
    togglePublished,
    copyLink,
    askDelete,
    qrPage,
    openQr: (page: BioPage) => setQrPage(page),
    closeQr: () => setQrPage(null),
  };
}
