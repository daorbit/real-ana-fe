import { useTranslation } from "react-i18next";
import { CalendarX2, Infinity as InfinityIcon, Mail } from "lucide-react";
import s from "./CheckoutPage.module.css";

export function TrustList() {
  const { t } = useTranslation();
  const items = [
    { icon: CalendarX2, text: t("billing.trustNoRenew", "No auto-renew — you choose when to pay again") },
    { icon: InfinityIcon, text: t("billing.trustNeverExpire", "Extra credits never expire") },
    { icon: Mail, text: t("billing.trustReceipt", "Receipt emailed after every payment") },
  ];

  return (
    <ul className={s.trust}>
      {items.map(({ icon: Icon, text }) => (
        <li key={text} className={s.trustItem}>
          <Icon size={14} />
          {text}
        </li>
      ))}
    </ul>
  );
}
