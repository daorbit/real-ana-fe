import { useTranslation } from "react-i18next";
import type { AddonPack } from "@/shared/types";
import { PackIcon, creditType } from "../../lib/credits";
import { PackStepper } from "../PackStepper";
import classes from "./Checkout.module.css";

export function CheckoutAddonRow({
  pack,
  unit,
  packs,
  busy,
  money,
  onChange,
}: {
  pack: AddonPack;
  unit: number;
  packs: number;
  busy: boolean;
  money: (amountMinor: number) => string;
  onChange: (packs: number) => void;
}) {
  const { t } = useTranslation();
  const picked = packs > 0;
  const credits = pack.quantity * packs;

  return (
    <li className={classes.packRow} data-picked={picked || undefined}>
      <span className={classes.packIcon}>
        <PackIcon type={pack.type} size={17} />
      </span>
      <div className={classes.packText}>
        <div className={classes.packName}>{pack.name}</div>
        <div className={classes.packMeta}>
          {picked
            ? t("billing.packAdded", { n: credits, type: creditType(t, pack.type, credits) })
            : t("billing.packUnit", {
                n: pack.quantity,
                type: creditType(t, pack.type, pack.quantity),
                price: money(unit),
              })}
        </div>
      </div>
      <span className={classes.packTotal}>{money(unit * packs)}</span>
      <PackStepper value={packs} disabled={busy} onChange={onChange} />
    </li>
  );
}
