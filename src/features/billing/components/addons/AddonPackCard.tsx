import { Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { num } from "@/shared/lib";
import { priceIn } from "@/shared/lib/currency";
import type { AddonPack, Currency } from "@/shared/types";
import { PackIcon, creditType } from "../../lib/credits";
import { packDiscount } from "../../lib/checkoutSavings";
import classes from "./Addons.module.css";

export function AddonPackCard({
  pack,
  addons,
  currency,
  money,
  disabled,
  isDemo,
  loading,
  onPick,
}: {
  pack: AddonPack;
  addons: AddonPack[];
  currency: Currency;
  money: (amountMinor: number) => string;
  disabled: boolean;
  isDemo: boolean;
  loading: boolean;
  onPick: (pack: AddonPack) => void;
}) {
  const { t } = useTranslation();
  const price = priceIn(pack.price, currency);
  const each = pack.quantity > 0 ? Math.round(price / pack.quantity) : price;
  const save = packDiscount(pack, addons, currency).percent;

  return (
    <li className={classes.pack}>
      <div className={classes.packTop}>
        <span className={classes.packIcon}>
          <PackIcon type={pack.type} size={18} />
        </span>
        {save > 0 && (
          <span className={classes.packBadge}>{t("billing.savePercent", "Save {{percent}}%", { percent: save })}</span>
        )}
      </div>

      <h4 className={classes.packName}>{pack.name}</h4>
      <p className={classes.packQty}>
        {t("billing.packQuantity", { n: num(pack.quantity), type: creditType(t, pack.type, pack.quantity) })}
        {" Â· "}
        {t("billing.perCredit", "{{price}} each", { price: money(each) })}
      </p>

      <div className={classes.packFoot}>
        <span className={classes.packPrice}>{money(price)}</span>
        <Button
          variant="default"
          radius="md"
          size="sm"
          disabled={disabled}
          loading={loading}
          onClick={() => onPick(pack)}
        >
          {isDemo ? t("billing.ctaSignUpBuy") : t("billing.ctaBuy")}
        </Button>
      </div>
    </li>
  );
}
