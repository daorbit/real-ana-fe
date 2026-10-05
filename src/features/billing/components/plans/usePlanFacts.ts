import { useTranslation } from "react-i18next";
import { BadgeCheck, Layers, Receipt } from "lucide-react";
import type { Fact } from "../common/FactList";

export function usePlanFacts(): Fact[] {
  const { t } = useTranslation();
  return [
    {
      icon: BadgeCheck,
      title: t("billing.factNoAutoRenewT", "No auto-renew"),
      text: t("billing.factNoAutoRenewD", "Every plan is a one-time payment for its cycle. Nothing is charged again unless you renew."),
    },
    {
      icon: Layers,
      title: t("billing.factKeepUsageT", "Upgrade any time"),
      text: t("billing.factKeepUsageD", "The new limit applies straight away, and this month's usage carries over."),
    },
    {
      icon: Receipt,
      title: t("billing.factReceiptT", "Receipts by email"),
      text: t("billing.factReceiptD", "A receipt lands in your inbox after every payment and stays under Payment history."),
    },
  ];
}
