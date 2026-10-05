import { Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Lock } from "lucide-react";
import s from "./CheckoutPage.module.css";

export function CheckoutTopBar({ onBack, disabled }: { onBack: () => void; disabled: boolean }) {
  const { t } = useTranslation();

  return (
    <div className={s.topBar}>
      <Button
        variant="subtle"
        color="gray"
        radius="md"
        size="compact-sm"
        className={s.back}
        leftSection={<ArrowLeft size={15} />}
        onClick={onBack}
        disabled={disabled}
      >
        {t("billing.backToPlans", "Back")}
      </Button>
      <h2 className={s.topTitle}>{t("billing.checkoutTitle", "Checkout")}</h2>
      <span className={s.secure}>
        <Lock size={12} />
        <span>{t("billing.secureCheckout", "Secure checkout")}</span>
      </span>
    </div>
  );
}
