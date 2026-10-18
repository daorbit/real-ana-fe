import { useTestAlertsMutation } from "@/features/alerts/api";
import { describeTestReport } from "@/features/alerts/lib/testReport";
import { useDemo } from "@/features/demo/context";
import { notify, notifyError } from "@/shared/lib/notify";

export function useAlertTest(workspaceId: string | undefined) {
  const { demo } = useDemo();
  const [test, { isLoading }] = useTestAlertsMutation();

  const send = async () => {
    if (!workspaceId) return;
    if (demo) {
      notify.error("Demo data is read-only. Turn off demo mode to send a test alert.");
      return;
    }
    try {
      const { sent, reached, issues } = describeTestReport(await test(workspaceId).unwrap());
      const message = issues.length ? `${sent} ${issues.join(". ")}.` : sent;
      if (!reached) notify.error(message);
      else if (issues.length) notify.info(message, "Alerts");
      else notify.success(message, "Alerts");
    } catch (e) {
      notifyError(e, "Could not send a test alert.");
    }
  };

  return { send, sending: isLoading };
}
