import { useTranslation } from "react-i18next";
import { Search, Globe2, ClipboardList, Infinity as InfinityIcon, Layers, Receipt } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import type { AddonPack, QuotaSummary, Currency } from "@/shared/types";
import { CreditBalance } from "./CreditBalance";
import { SectionHeader } from "./common/SectionHeader";
import { CurrencyControl } from "./common/CurrencyControl";
import { RefetchButton } from "./common/RefetchButton";
import { FactList } from "./common/FactList";
import { AddonPackCard } from "./addons/AddonPackCard";
import { sortPacks } from "../lib/credits";
import classes from "./addons/Addons.module.css";

interface Props {
  addons: AddonPack[];
  usage: QuotaSummary;
  currency: Currency;
  changeCurrency: (currency: Currency) => void;
  money: (amountMinor: number) => string;
  refetching: boolean;
  refetchPrices: () => void;
  isDemo: boolean;
  selectedWorkspaceId: string | null;
  buying: string | null;
  onPick: (pack: AddonPack) => void;
}

export function AddonsTab({
  addons, usage, currency, changeCurrency, money, refetching, refetchPrices,
  isDemo, selectedWorkspaceId, buying, onPick,
}: Props) {
  const { t } = useTranslation();

  return (
    <div>
      <SectionHeader
        title={t("billing.addonsTitle")}
        description={t("billing.addonsSubtitle")}
        actions={
          <>
            <CurrencyControl value={currency} onChange={changeCurrency} />
            <RefetchButton label={t("billing.refetchPrices")} loading={refetching} onClick={refetchPrices} />
          </>
        }
      />

      {usage && (
        <>
          <p className={classes.sectionLabel}>{t("billing.yourBalance", "Your balance")}</p>
          <div className={classes.balances}>
            <CreditBalance
              icon={Search}
              label={t("billing.auditCredits")}
              planLeft={Math.max(0, usage.audits.planQuota - usage.audits.used)}
              addonCredits={usage.audits.addonCredits}
            />
            <CreditBalance
              icon={Globe2}
              label={t("billing.crawlCredits")}
              planLeft={Math.max(0, usage.crawls.planQuota - usage.crawls.used)}
              addonCredits={usage.crawls.addonCredits}
            />
            {usage.orbit && (
              <CreditBalance
                icon={OrbitMark}
                label={t("billing.orbitCredits")}
                planLeft={Math.max(0, usage.orbit.planQuota - usage.orbit.used)}
                addonCredits={usage.orbit.addonCredits}
              />
            )}
            {usage.forms && (
              <CreditBalance
                icon={ClipboardList}
                label={t("billing.formSubmissionCredits")}
                planLeft={Math.max(0, usage.forms.submissionQuota - usage.forms.submissionsUsed)}
                addonCredits={usage.forms.addonCredits}
              />
            )}
          </div>
        </>
      )}

      <p className={classes.sectionLabel}>{t("billing.packsLabel", "Packs")}</p>
      {addons.length ? (
        <ul className={classes.packs}>
          {sortPacks(addons).map((pack) => (
            <AddonPackCard
              key={pack._id}
              pack={pack}
              addons={addons}
              currency={currency}
              money={money}
              isDemo={isDemo}
              disabled={isDemo || !selectedWorkspaceId}
              loading={buying === pack._id}
              onPick={onPick}
            />
          ))}
        </ul>
      ) : (
        <div className={classes.empty}>{t("billing.noAddons")}</div>
      )}

      <FactList
        facts={[
          {
            icon: InfinityIcon,
            title: t("billing.factNeverExpireT", "Credits never expire"),
            text: t("billing.factNeverExpireD", "Bought credits carry across months and renewals until you use them."),
          },
          {
            icon: Layers,
            title: t("billing.factPlanFirstT", "Plan allowance first"),
            text: t("billing.factPlanFirstD", "Credits are only drawn on once the month's plan allowance runs out."),
          },
          {
            icon: Receipt,
            title: t("billing.factOneTimeT", "One-time payment"),
            text: t("billing.factOneTimeD", "Credits are added as soon as payment is confirmed, with a receipt by email."),
          },
        ]}
      />
    </div>
  );
}
