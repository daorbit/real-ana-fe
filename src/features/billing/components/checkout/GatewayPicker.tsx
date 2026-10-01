import type { ReactNode } from "react";
import { TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Check, Phone } from "lucide-react";
import type { Currency, PaymentGateway } from "@/shared/types";
import type { GatewayChoice } from "../../hooks/useGatewayChoice";
import { CashfreeLogo, RazorpayLogo } from "../GatewayLogos";
import classes from "./Checkout.module.css";

const GATEWAYS: { value: PaymentGateway; logo: ReactNode }[] = [
  { value: "razorpay", logo: <RazorpayLogo height={16} /> },
  { value: "cashfree", logo: <CashfreeLogo height={24} /> },
];

export function GatewayPicker({
  choice,
  currency,
  busy,
}: {
  choice: GatewayChoice;
  currency: Currency;
  busy: boolean;
}) {
  const { t } = useTranslation();
  const { gateway, setGateway, phone, setPhone, cashfreeDisabled } = choice;

  return (
    <div>
      <p className={classes.fieldLabel}>{t("billing.payWith", "Pay with")}</p>
      <div className={classes.gateways} role="radiogroup" aria-label={t("billing.payWith", "Pay with")}>
        {GATEWAYS.map(({ value, logo }) => {
          const soon = value === "cashfree" && cashfreeDisabled;
          const active = gateway === value;
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={active}
              className={classes.gateway}
              data-active={active || undefined}
              disabled={busy || soon}
              onClick={() => setGateway(value)}
            >
              <span className={classes.gatewayLogo}>{logo}</span>
              {soon && <span className={classes.soon}>{t("billing.soon", "Soon")}</span>}
              {active && (
                <span className={classes.gatewayCheck} aria-hidden>
                  <Check size={10} strokeWidth={3.5} />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {cashfreeDisabled && (
        <p className={classes.gatewayNote}>
          {t("billing.cashfreeCurrencySoon", "Cashfree does not take {{currency}} payments yet — coming soon.", {
            currency,
          })}
        </p>
      )}

      {gateway === "cashfree" && !cashfreeDisabled && (
        <TextInput
          className={classes.phone}
          label={t("billing.mobileForReceipt", "Mobile number")}
          description={t("billing.mobileCashfreeHint", "Cashfree sends the payment receipt here.")}
          placeholder="9876543210"
          leftSection={<Phone size={15} />}
          value={phone}
          onChange={(e) => setPhone(e.currentTarget.value)}
          disabled={busy}
        />
      )}
    </div>
  );
}
