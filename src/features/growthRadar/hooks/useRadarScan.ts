import { useDemo } from "@/features/demo/context";
import { notify, notifyError } from "@/shared/lib/notify";
import { useRunRadarScanMutation } from "../api";

export function useRadarScan(workspaceId: string) {
  const { demo } = useDemo();
  const [scan, { isLoading }] = useRunRadarScanMutation();

  const run = async () => {
    if (demo) return notify.error("Turn off demo data to run a check.");
    try {
      const result = await scan(workspaceId).unwrap();
      const created = result.lastScan?.created ?? 0;
      notify.success(created ? `Check finished: ${created} new ${created === 1 ? "finding" : "findings"}` : "Check finished. Nothing new");
    } catch (e) {
      notifyError(e, "The check did not finish.");
    }
  };

  return { run, scanning: isLoading };
}
