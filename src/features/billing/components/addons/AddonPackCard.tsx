import { Button } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import { priceIn } from "@/shared/lib/currency";
import type { AddonPack, Currency } from "@/shared/types";
import { PackIcon, creditType } from "../../lib/credits";
import classes from "./Addons.module.css";

export function AddonPackCard({
  pack,
  currency,
  money,
  disabled,
  isDemo,
  loading,
  onPick,
}: {
  pack: AddonPack;
  currency: Currency;
  money: (amountMinor: number) => string;
  disabled: boolean;
  isDemo: boolean;
  loading: boolean;
  onPick: (pack: AddonPack) => void;
}) {
  const { t } = useTranslation();

  return (
    <article className={classes.pack}>
      <div className={classes.packTop}>
        <span className={classes.packIcon}>
          <PackIcon type={pack.type} size={19} />
        </span>
        <div>
          <h4 className={classes.packName}>{pack.name}</h4>
          <p className={classes.packQty}>
            {t("billing.packQuantity", { n: pack.quantity, type: creditType(t, pack.type, pack.quantity) })}
          </p>
        </div>
      </div>

      <div className={classes.packFoot}>
        <span className={classes.packPrice}>{money(priceIn(pack.price, currency))}</span>
        <Button
          radius="md"
          color="emerald"
          variant="light"
          leftSection={<ShoppingCart size={15} />}
          disabled={disabled}
          loading={loading}
          onClick={() => onPick(pack)}
        >
          {isDemo ? t("billing.ctaSignUpBuy") : t("billing.ctaBuy")}
        </Button>
      </div>
    </article>
  );
}
