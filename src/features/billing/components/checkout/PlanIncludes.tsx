import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import type { Plan } from "@/shared/types";
import { planFeatureLines } from "../../lib/planFeatures";
import s from "./CheckoutPage.module.css";

export function PlanIncludes({ plan }: { plan: Plan }) {
  const { t } = useTranslation();

  return (
    <ul className={s.features}>
      {planFeatureLines(plan, t).map((f, i) => (
        <li key={`${i}:${f}`} className={s.feature}>
          <Check size={15} strokeWidth={2.5} />
          {f}
        </li>
      ))}
    </ul>
  );
}
