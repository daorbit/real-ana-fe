import { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import type { Plan } from "@/shared/types";
import { CHECKOUT_PARAM } from "../lib/constants";

export function useCheckoutIntent(plans: Plan[], onPlan: (plan: Plan) => void) {
  const [params, setParams] = useSearchParams();
  const slug = params.get(CHECKOUT_PARAM);
  const onPlanRef = useRef(onPlan);
  onPlanRef.current = onPlan;

  useEffect(() => {
    if (!slug || !plans.length) return;
    const next = new URLSearchParams(params);
    next.delete(CHECKOUT_PARAM);
    next.delete("cycle");
    setParams(next, { replace: true });
    const plan = plans.find((p) => p.slug === slug);
    if (plan) onPlanRef.current(plan);
  }, [slug, plans, params, setParams]);
}
