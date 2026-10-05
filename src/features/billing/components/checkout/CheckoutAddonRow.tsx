import { useTranslation } from "react-i18next";
import { num } from "@/shared/lib";
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
  savePercent = 0,
  balance = null,
}: {
  pack: AddonPack;
  unit: number;
  packs: number;
  busy: boolean;
  money: (amountMinor: number) => string;
  onChange: (packs: number) => void;
  savePercent?: number;
  balance?: number | null;
}) {
  const { t } = useTranslation();
  const picked = packs > 0;
  const credits = pack.quantity * packs;

  return (
    <li className={classes.packTile} data-picked={picked || undefined}>
      <div className={classes.packTileHead}>
        <span className={classes.packIcon}>
          <PackIcon type={pack.type} size={17} />
        </span>
        <PackStepper value={packs} disabled={busy} onChange={onChange} />
      </div>
      <div className={classes.packNameRow}>
        <span className={classes.packName}>{pack.name}</span>
        {picked && <span className={classes.packTotal}>{money(unit * packs)}</span>}
      </div>
      <div className={classes.packMeta}>
        {picked
          ? t("billing.packAdded", { n: credits, type: creditType(t, pack.type, credits) })
          : t("billing.packUnit", {
              n: pack.quantity,
              type: creditType(t, pack.type, pack.quantity),
              price: money(unit),
            })}
      </div>
      {(balance !== null || savePercent > 0) && (
        <div className={classes.packFoot}>
          <span>{balance !== null && t("billing.balanceLeft", "You have {{n}} left", { n: num(balance) })}</span>
          {savePercent > 0 && (
            <span className={classes.packBadge}>
              {t("billing.savePercent", "Save {{percent}}%", { percent: savePercent })}
            </span>
          )}
        </div>
      )}
    </li>
  );
}
