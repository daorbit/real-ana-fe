import { useRemoveSearchSitemapMutation, useSubmitSearchSitemapMutation } from "@/app/store";
import { confirmDelete, errMessage, notify } from "@/shared/lib/notify";
import { sitemapPath } from "./sitemapUrl";

export function useSitemapActions(workspaceId: string, siteId: string) {
  const [submitMutation, submitState] = useSubmitSearchSitemapMutation();
  const [removeMutation, removeState] = useRemoveSearchSitemapMutation();

  const submit = async (url: string, resubmit = false): Promise<boolean> => {
    try {
      await submitMutation({ workspaceId, siteId, url }).unwrap();
      notify.success(resubmit ? "Google will read this sitemap again soon" : "Sitemap submitted to Google");
      return true;
    } catch (e) {
      notify.error(errMessage(e, "The sitemap could not be submitted."));
      return false;
    }
  };

  const remove = (url: string) =>
    confirmDelete({
      title: "Remove this sitemap?",
      body: `Google will stop reading ${sitemapPath(url)}. Pages it listed stay in Google, and you can submit it again at any time.`,
      confirmLabel: "Remove",
      onConfirm: async () => {
        try {
          await removeMutation({ workspaceId, siteId, url }).unwrap();
          notify.success("Sitemap removed");
        } catch (e) {
          notify.error(errMessage(e, "The sitemap could not be removed."));
        }
      },
    });

  return {
    submit,
    remove,
    submitting: submitState.isLoading,
    pendingUrl: submitState.isLoading
      ? submitState.originalArgs?.url
      : removeState.isLoading
        ? removeState.originalArgs?.url
        : undefined,
  };
}
