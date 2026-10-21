import { useRemoveSeoAuditPageMutation } from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import type { SeoShareLink } from "@/shared/types";
import { prettyUrl } from "./prettyUrl";

export function useRemoveSeoPage(workspaceId: string, siteId: string) {
  const { demo } = useDemo();
  const [remove] = useRemoveSeoAuditPageMutation();

  return (link: SeoShareLink) => {
    if (demo) {
      notify.error("Turn off demo data to remove a page.");
      return;
    }
    const page = prettyUrl(link.url);
    confirmDelete({
      title: "Remove this page?",
      confirmLabel: "Remove page",
      body: (
        <>
          Deletes every audit of <b>{page}</b> and its report link stops working. You can audit the page again
          from the SEO page at any time.
        </>
      ),
      onConfirm: async () => {
        try {
          await remove({ workspaceId, siteId, reportId: link.reportId }).unwrap();
          notify.success(`${page} was removed.`);
        } catch (e) {
          notify.error(errMessage(e, "Could not remove this page."));
        }
      },
    });
  };
}
