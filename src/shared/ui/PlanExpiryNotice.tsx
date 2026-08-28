import { useState } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { CalendarClock, ArrowUpCircle, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/features/auth/context";
import { useGetWorkspaceUsageQuery } from "@/app/store";
import "./PlanExpiryNotice.css";

const WARN_WITHIN_DAYS = 7;

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function PlanExpiryNotice() {
  const nav = useNavigate();
  const { active } = useWorkspace();
  const { user } = useAuth();
  const { data } = useGetWorkspaceUsageQuery(active?._id ?? "", { skip: !active?._id });
  const [dismissed, setDismissed] = useState(false);

  if (!data || user?.demo || user?.impersonating || dismissed) return null;

  const lapsed = data.status === "expired" && data.lapsedPlan;
  const daysLeft = data.currentPeriodEnd ? daysUntil(data.currentPeriodEnd) : null;
  const ending =
    !lapsed &&
    data.plan.slug !== "free" &&
    daysLeft !== null &&
    daysLeft > 0 &&
    daysLeft <= WARN_WITHIN_DAYS;

  if (!lapsed && !ending) return null;

  const tone = lapsed ? "lapsed" : "ending";

  return (
    <div className={`plan-notice plan-notice--${tone}`}>
      <span className="plan-notice__icon">
        <CalendarClock size={17} strokeWidth={2} />
      </span>

      <Stack gap={2} className="plan-notice__body">
        <Text className="plan-notice__title">
          {lapsed
            ? `Your ${data.lapsedPlan?.name} plan has ended`
            : daysLeft === 1
              ? `Your ${data.plan.name} plan ends tomorrow`
              : `Your ${data.plan.name} plan ends in ${daysLeft} days`}
        </Text>
        <Text className="plan-notice__detail">
          {lapsed
            ? "This workspace is on the Free plan for now. Everything already collected is still here, and tracking continues at Free's allowance."
            : "Plans don't renew on their own — renew to keep the paid features."}
        </Text>
      </Stack>

      <Group gap={6} wrap="nowrap" className="plan-notice__actions">
        <Button
          size="xs"
          radius="md"
          variant="white"
          className="plan-notice__cta"
          leftSection={<ArrowUpCircle size={14} />}
          onClick={() => nav("/app/billing")}
        >
          {lapsed ? "Renew plan" : "View plans"}
        </Button>
        <button
          type="button"
          className="plan-notice__close"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          <X size={15} />
        </button>
      </Group>
    </div>
  );
}
