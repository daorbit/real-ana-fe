import { useSetSeoShareMutation } from "@/app/store";
import { useDemo } from "@/features/demo/context";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";

export function useReplaceSeoLink(workspaceId: string, siteId: string) {
  const { demo } = useDemo();
  const [setShare] = useSetSeoShareMutation();

  return (reportId: string) => {
    if (demo) {
      notify.error("Turn off demo data to generate a new link.");
      return;
    }
    confirmDelete({
      title: "Replace this link?",
      confirmLabel: "Replace link",
      body: "The current link stops working immediately. Anyone you already sent it to will need the new one.",
      onConfirm: async () => {
        try {
          await setShare({ workspaceId, siteId, reportId, enabled: true, rotate: true }).unwrap();
          notify.success("A new link has been generated.", "Link replaced");
        } catch (e) {
          notify.error(errMessage(e, "Could not generate a new link."));
        }
      },
    });
  };
}
