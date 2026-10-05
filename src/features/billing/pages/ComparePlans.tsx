import { Button } from "@mantine/core";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import { BillingSkeleton } from "@/shared/ui/Skeletons";
import { ErrorState } from "@/shared/ui/ErrorState";
import { useGetPlansQuery, useGetWorkspaceUsageQuery } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { useWorkspace } from "@/features/workspace/context";
import { useTitle } from "@/shared/lib/useTitle";
import type { Plan } from "@/shared/types";

import { useBillingView } from "../hooks/useBillingView";
import { SectionHeader } from "../components/common/SectionHeader";
import { CurrencyControl } from "../components/common/CurrencyControl";
import { CycleControl } from "../components/common/CycleControl";
import { FactList } from "../components/common/FactList";
import { PlanGrid } from "../components/plans/PlanGrid";
import { usePlanFacts } from "../components/plans/usePlanFacts";
import { PlanComparisonTable } from "../components/compare/PlanComparisonTable";
import { featuredPlanSlug } from "../lib/planFeatures";
import { BILLING_PATH, CHECKOUT_PARAM } from "../lib/constants";
import compare from "../components/compare/Compare.module.css";

export default function ComparePlans() {
  const { t } = useTranslation();
  useTitle(t("billing.compareTitle", "Compare plans"));
  const nav = useNavigate();
  const { isDemo } = useAuth();
  const { active, loading: workspaceLoading } = useWorkspace();
  const { cycle, setCycle, currency, changeCurrency, money } = useBillingView();
  const facts = usePlanFacts();

  const workspaceId = active?._id ?? null;
  const { data: plans = [], isLoading, isError, isFetching, refetch } = useGetPlansQuery(
    { currency, workspaceId },
    { refetchOnMountOrArgChange: true },
  );
  const { data: liveUsage } = useGetWorkspaceUsageQuery(workspaceId ?? "", { skip: !workspaceId });
  const usage = liveUsage ?? active?.billing ?? null;
  const expired = usage?.status === "expired";
  const currentSlug = usage && !expired ? usage.plan.slug : null;
  const featuredSlug = featuredPlanSlug(plans, usage?.plan.slug ?? null, currency);

  const pick = (plan: Plan) =>
    nav(`${BILLING_PATH}?${CHECKOUT_PARAM}=${encodeURIComponent(plan.slug)}&cycle=${cycle}`);

  return (
    <AppShell>
      <PageHeader
        title={t("billing.compareTitle", "Compare plans")}
        description={t(
          "billing.compareDescription",
          "Every plan includes the full dashboard. What changes is how much you can run.",
        )}
        actions={
          <Button variant="default" radius="md" leftSection={<ArrowLeft size={15} />} onClick={() => nav(BILLING_PATH)}>
            {t("billing.backToBilling", "Back to billing")}
          </Button>
        }
      />

      {isLoading || workspaceLoading ? (
        <BillingSkeleton />
      ) : isError ? (
        <ErrorState
          title={t("billing.plansLoadError", "Couldn't load plans")}
          onRetry={() => void refetch()}
          retrying={isFetching}
        />
      ) : (
        <>
          <SectionHeader
            title={t("billing.compareCardsTitle", "Choose your plan")}
            description={t("billing.plansSubtitle")}
            actions={
              <>
                <CurrencyControl value={currency} onChange={changeCurrency} />
                <CycleControl value={cycle} onChange={setCycle} />
              </>
            }
          />

          <PlanGrid
            plans={plans}
            usage={usage}
            expired={expired}
            featuredSlug={featuredSlug}
            cycle={cycle}
            currency={currency}
            money={money}
            isDemo={isDemo}
            selectedWorkspaceId={workspaceId}
            subscribing={null}
            onPick={pick}
          />

          <section className={compare.section}>
            <SectionHeader
              title={t("billing.compareTableTitle", "Compare every feature")}
              description={t("billing.compareTableSubtitle", "The full matrix, side by side, with nothing hidden.")}
            />
            <PlanComparisonTable
              plans={plans}
              currentSlug={currentSlug}
              featuredSlug={featuredSlug}
              cycle={cycle}
              currency={currency}
              money={money}
            />
          </section>

          <FactList facts={facts} />
        </>
      )}
    </AppShell>
  );
}
