import type { ReactNode } from "react";
import { Tabs } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Activity, Layers, Receipt, ShoppingCart } from "lucide-react";
import type { BillingTab } from "../hooks/useBillingView";
import classes from "./BillingTabs.module.css";

export function BillingTabs({
  value,
  onChange,
  children,
}: {
  value: BillingTab;
  onChange: (tab: BillingTab) => void;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const tabs = [
    { value: "plans", icon: Layers, label: t("billing.tabPlans") },
    { value: "usage", icon: Activity, label: t("billing.tabUsage", "Usage") },
    { value: "addons", icon: ShoppingCart, label: t("billing.tabAddons") },
    { value: "history", icon: Receipt, label: t("billing.tabHistory") },
  ] as const;

  return (
    <Tabs
      unstyled
      value={value}
      onChange={(v) => v && onChange(v as BillingTab)}
      keepMounted={false}
      classNames={{ list: classes.list, tab: classes.tab, tabSection: classes.tabSection }}
    >
      <Tabs.List>
        {tabs.map(({ value: tab, icon: Icon, label }) => (
          <Tabs.Tab key={tab} value={tab} leftSection={<Icon size={15} />}>
            {label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {children}
    </Tabs>
  );
}
