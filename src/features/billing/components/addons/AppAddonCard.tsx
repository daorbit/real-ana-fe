import { Button } from "@mantine/core";
import { Check, LockOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import type { PaidAppId } from "@/shared/types";
import { BrandMark } from "@/features/integrations/components/logos/BrandMarks";
import { AppUnlockCheckout } from "@/features/integrations/components/quantalogApps/AppUnlockCheckout";
import { useAppUnlock } from "@/features/integrations/hooks/useAppUnlock";
import { useToggleWorkspaceApp } from "@/features/integrations/hooks/useToggleWorkspaceApp";
import { WORKSPACE_APP_INFO } from "@/features/integrations/lib/quantalogApps";
import { appsPath } from "@/features/integrations/lib/appsPath";
import classes from "./Addons.module.css";

export function AppAddonCard({ app }: { app: PaidAppId }) {
  const { t } = useTranslation();
  const info = WORKSPACE_APP_INFO[app];
  const unlock = useAppUnlock(app);
  const { canManage } = useToggleWorkspaceApp(app);

  return (
    <li className={classes.pack}>
      <div className={classes.packTop}>
        <BrandMark id={info.tileId} size={36} />
        {!unlock.locked && (
          <span className={classes.appOwned}>
            <Check size={12} />
            {t("billing.appUnlocked")}
          </span>
        )}
      </div>

      <h4 className={classes.packName}>{info.name}</h4>
      <p className={classes.appTagline}>{info.tagline}</p>

      <div className={classes.packFoot}>
        {unlock.locked ? (
          <>
            <span className={classes.packPrice}>{unlock.priceLabel ?? "—"}</span>
            <Button
              variant="default"
              radius="md"
              size="sm"
              leftSection={<LockOpen size={14} />}
              disabled={!canManage || unlock.price === null}
              loading={unlock.buying}
              onClick={unlock.openCheckout}
            >
              {t("billing.appUnlock")}
            </Button>
          </>
        ) : (
          <>
            <span className={classes.appOnce}>{t("billing.appPaidOnce")}</span>
            <Button component={Link} to={appsPath(info.tileId)} variant="default" radius="md" size="sm">
              {t("billing.appManage")}
            </Button>
          </>
        )}
      </div>

      {unlock.locked && unlock.price !== null && (
        <AppUnlockCheckout
          info={info}
          opened={unlock.checkoutOpen}
          price={unlock.price}
          currency={unlock.currency}
          busy={unlock.buying}
          canManage={canManage}
          onClose={unlock.closeCheckout}
          onConfirm={(request) => void unlock.buy(request)}
        />
      )}
    </li>
  );
}
