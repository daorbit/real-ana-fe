import { useEffect, useState } from "react";
import { Button, Group, Stack, Text } from "@mantine/core";
import { CalendarClock, ArrowUpCircle, X, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useWorkspace } from "@/features/workspace/context";
import { useAuth } from "@/features/auth/context";
import { useGetWorkspaceUsageQuery } from "@/app/store";
import "./PlanExpiryNotice.css";

const WARN_WITHIN_DAYS = 7;
/** "Remind me later" hides the card for this long, then it returns. */
const SNOOZE_MS = 24 * 60 * 60 * 1000;
const STORE_KEY = "quantalog:plan-notice-dismissed";

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

/**
 * A dismissal that is scoped to one billing period: the key is the period end,
 * so the card comes back on its own next cycle rather than being silenced for
 * good. `until` lets "remind me later" hide it for a day without marking the
 * whole period done.
 */
type Dismissal = { key: string; until: number };

function readDismissal(): Dismissal | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Dismissal>;
    if (typeof parsed?.key !== "string" || typeof parsed?.until !== "number") return null;
    return { key: parsed.key, until: parsed.until };
  } catch {
    return null;
  }
}

function writeDismissal(d: Dismissal): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(d));
  } catch {
    /* storage unavailable — the card just shows again next mount */
  }
}

export function PlanExpiryNotice() {
  const nav = useNavigate();
  const { active } = useWorkspace();
  const { user } = useAuth();
  const { data } = useGetWorkspaceUsageQuery(active?._id ?? "", { skip: !active?._id });

  // Kept in state so a dismiss re-renders the component away immediately.
  const [dismissal, setDismissal] = useState<Dismissal | null>(() => readDismissal());
  // Drives the slide-in; flipped on after mount so the transition runs.
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(id);
  }, []);

  if (!data || user?.demo || user?.impersonating) return null;

  const lapsed = data.status === "expired" && data.lapsedPlan;
  const daysLeft = data.currentPeriodEnd ? daysUntil(data.currentPeriodEnd) : null;
  const ending =
    !lapsed &&
    data.plan.slug !== "free" &&
    daysLeft !== null &&
    daysLeft > 0 &&
    daysLeft <= WARN_WITHIN_DAYS;

  if (!lapsed && !ending) return null;

  // One key per billing period (or the lapsed plan's id), so a dismissal in
  // this cycle does not carry into the next.
  const periodKey = lapsed
    ? `lapsed:${data.lapsedPlan?.name ?? "?"}`
    : `ends:${data.currentPeriodEnd ?? "?"}`;

  if (dismissal && dismissal.key === periodKey && dismissal.until > Date.now()) {
    return null;
  }

  const tone = lapsed ? "lapsed" : "ending";

  const dismiss = (until: number) => {
    const d = { key: periodKey, until };
    writeDismissal(d);
    setDismissal(d);
  };

  return (
    <div
      className={`plan-notice plan-notice--${tone}`}
      data-shown={shown || undefined}
      role="status"
    >
      <button
        type="button"
        className="plan-notice__close"
        onClick={() => dismiss(Number.MAX_SAFE_INTEGER)}
        aria-label="Dismiss for this billing period"
      >
        <X size={15} />
      </button>

      <Group gap={11} wrap="nowrap" align="flex-start">
        <span className="plan-notice__icon">
          <CalendarClock size={17} strokeWidth={2} />
        </span>

        <Stack gap={3} className="plan-notice__body">
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
      </Group>

      <Group gap={8} wrap="nowrap" className="plan-notice__actions">
        <Button
          size="xs"
          radius="md"
          className="plan-notice__cta"
          leftSection={<ArrowUpCircle size={14} />}
          onClick={() => nav("/app/billing")}
        >
          {lapsed ? "Renew plan" : "View plans"}
        </Button>
        {!lapsed && (
          <Button
            size="xs"
            radius="md"
            variant="subtle"
            color="gray"
            className="plan-notice__later"
            leftSection={<Clock size={13} />}
            onClick={() => dismiss(Date.now() + SNOOZE_MS)}
          >
            Remind me later
          </Button>
        )}
      </Group>
    </div>
  );
}
