import type { BillingCycle, Currency, Plan, QuotaSummary } from "@/shared/types";
import { PlanCard } from "./PlanCard";
import classes from "./Plans.module.css";

interface Props {
  plans: Plan[];
  usage: QuotaSummary;
  expired: boolean;
  featuredSlug: string | null;
  cycle: BillingCycle;
  currency: Currency;
  money: (amountMinor: number) => string;
  isDemo: boolean;
  selectedWorkspaceId: string | null;
  subscribing: string | null;
  onPick: (plan: Plan) => void;
  featureLimit?: number;
  onSeeAll?: () => void;
}

export function PlanGrid({ plans, usage, expired, featuredSlug, ...rest }: Props) {
  const currentIndex = plans.findIndex((p) => p.slug === usage?.plan.slug);

  return (
    <div className={classes.grid}>
      {plans.map((plan, index) => {
        const current = usage?.plan.slug === plan.slug && !expired;
        return (
          <PlanCard
            key={plan.slug}
            plan={plan}
            usage={usage}
            expired={expired}
            featured={plan.slug === featuredSlug && !current}
            lower={!expired && currentIndex > -1 && index < currentIndex}
            {...rest}
          />
        );
      })}
    </div>
  );
}
