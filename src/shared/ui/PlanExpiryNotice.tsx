import { useEffect, useState } from "react";
import { UnstyledButton } from "@mantine/core";
import { ArrowRight, CalendarClock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useActiveUsage } from "@/features/workspace/context";
import { useAuth } from "@/features/auth/context";
import { shortDate } from "@/shared/lib";
import { readDismissal, writeDismissal, type Dismissal } from "./planNoticeDismissal";
import "./PlanExpiryNotice.css";

const WARN_WITHIN_DAYS = 7;
const SNOOZE_MS = 24 * 60 * 60 * 1000;

function daysUntil(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
}

export function PlanExpiryNotice() {
  const nav = useNavigate();
  const { user } = useAuth();
  const data = useActiveUsage();

  const [dismissal, setDismissal] = useState<Dismissal | null>(() => readDismissal());
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

  const periodKey = lapsed
    ? `lapsed:${data.lapsedPlan?.name ?? "?"}`
    : `ends:${data.currentPeriodEnd ?? "?"}`;

  if (dismissal && dismissal.key === periodKey && dismissal.until > Date.now()) {
    return null;
  }

  const dismiss = (until: number) => {
    const d = { key: periodKey, until };
    writeDismissal(d);
    setDismissal(d);
  };

  const title = lapsed
    ? `Your ${data.lapsedPlan?.name} plan has ended`
    : daysLeft === 1
      ? `Your ${data.plan.name} plan ends tomorrow`
      : `Your ${data.plan.name} plan ends ${shortDate(data.currentPeriodEnd!)}`;

  const cycleWord = data.cycle === "yearly" ? "yearly" : "monthly";
  const detail = lapsed
    ? "You're on Free for now. Your data is safe and tracking continues at Free limits."
    : `Your ${cycleWord} plan doesn't renew automatically. Renew now and the new period starts when this one ends, so you lose no days.`;

  const renewSlug = lapsed ? data.lapsedPlan?.slug : data.plan.slug;
  const renewPath = renewSlug
    ? `/app/billing?checkout=${encodeURIComponent(renewSlug)}&cycle=${data.cycle ?? "monthly"}`
    : "/app/billing";

  return (
    <aside
      className={`plan-notice plan-notice--${lapsed ? "lapsed" : "ending"}`}
      data-shown={shown || undefined}
      role="status"
      aria-live="polite"
    >
      <div className="plan-notice__head">
        <div className="plan-notice__badge" aria-hidden>
          {lapsed ? (
            <CalendarClock size={20} strokeWidth={1.8} />
          ) : (
            <>
              <span className="plan-notice__count">{daysLeft}</span>
              <span className="plan-notice__unit">{daysLeft === 1 ? "day" : "days"}</span>
            </>
          )}
        </div>

        <div className="plan-notice__body">
          <p className="plan-notice__eyebrow">{lapsed ? "Plan ended" : "Renewal due"}</p>
          <p className="plan-notice__title">{title}</p>
          <p className="plan-notice__detail">{detail}</p>
        </div>

        <button
          type="button"
          className="plan-notice__close"
          onClick={() => dismiss(Number.MAX_SAFE_INTEGER)}
          aria-label="Dismiss for this billing period"
        >
          <X size={14} strokeWidth={2.2} />
        </button>
      </div>

      <div className="plan-notice__actions">
        {!lapsed && (
          <UnstyledButton
            className="plan-notice__btn plan-notice__btn--quiet"
            onClick={() => dismiss(Date.now() + SNOOZE_MS)}
          >
            Remind me tomorrow
          </UnstyledButton>
        )}
        <UnstyledButton
          className="plan-notice__btn plan-notice__btn--primary"
          onClick={() => nav(renewPath)}
        >
          {lapsed ? `Renew ${data.lapsedPlan?.name ?? "plan"}` : `Renew ${data.plan.name}`}
          <ArrowRight size={14} strokeWidth={2.2} />
        </UnstyledButton>
      </div>
    </aside>
  );
}
