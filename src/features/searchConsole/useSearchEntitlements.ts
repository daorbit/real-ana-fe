import { useNavigate } from "react-router-dom";
import { useActiveBilling } from "@/features/workspace/context";
import { notify } from "@/shared/lib/notify";

export function useSearchEntitlements() {
  const billing = useActiveBilling();
  const search = billing?.search;
  const inspections = search?.inspections;

  return {
    planName: billing?.plan.name ?? "Your",
    maxDays: search?.maxDays ?? 480,
    rowLimit: search?.rowLimit ?? null,
    insights: search?.insights ?? "full",
    pageViews: search?.pageViews ?? true,
    inspectionQuota: inspections?.planQuota ?? 0,
    canInspect: inspections
      ? inspections.used < inspections.planQuota || inspections.addonCredits > 0
      : true,
    inspectionsLeft: inspections
      ? Math.max(0, inspections.planQuota - inspections.used) + inspections.addonCredits
      : null,
  };
}

export function useSearchUpgrade() {
  const navigate = useNavigate();
  return {
    goToPlans: () => navigate("/app/billing"),
    prompt: (message: string) => notify.quotaLimit(message, undefined, "plan_required"),
  };
}
