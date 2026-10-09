import { useActiveBilling } from "@/features/workspace/context";
import { notify } from "@/shared/lib/notify";

export type CountedFeature = "dashboards" | "embeds" | "goalTargets";

const COPY: Record<CountedFeature, { kind: string; label: string; noun: string; plural: string }> = {
  dashboards: { kind: "dashboards", label: "Dashboards", noun: "custom dashboard", plural: "custom dashboards" },
  embeds: { kind: "embeds", label: "Embedded widgets", noun: "embedded widget", plural: "embedded widgets" },
  goalTargets: { kind: "goal_targets", label: "Goal targets", noun: "goal target", plural: "goal targets" },
};

export function useFeatureAllowance(feature: CountedFeature, used: number) {
  const billing = useActiveBilling();
  const copy = COPY[feature];
  const quota = billing?.[feature]?.quota ?? null;
  const plan = billing?.plan.name ?? "Your";
  const locked = quota === 0;
  const atLimit = quota !== null && used >= quota;

  const prompt = () =>
    notify.quotaLimit(
      locked
        ? `${copy.label} are not included in the ${plan} plan. Upgrade to use them.`
        : `The ${plan} plan includes ${quota} ${quota === 1 ? copy.noun : copy.plural}. Upgrade to add more.`,
      { kind: copy.kind, label: copy.label, used, quota: quota ?? undefined, plan },
      locked ? "plan_required" : "quota_exceeded",
    );

  const guard = (action: () => void) => {
    if (atLimit) prompt();
    else action();
  };

  return {
    quota,
    used,
    locked,
    atLimit,
    plan,
    prompt,
    guard,
    usage: quota === null ? null : `${used} / ${quota}`,
  };
}
