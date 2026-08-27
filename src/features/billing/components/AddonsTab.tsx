import {
  Title, Text, Group, Button, Card, SimpleGrid, SegmentedControl, Divider,
  ThemeIcon, ActionIcon, Tooltip,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { RefreshCw, Search, Globe2, ClipboardList } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { CreditBalance } from "./CreditBalance";
import { PackIcon, creditType } from "../lib/credits";
import { CURRENCIES, priceIn } from "@/shared/lib/currency";
import type { AddonPack, QuotaSummary, Currency } from "@/shared/types";

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

/** Credit packs, above the balances they top up. */
export function AddonsTab({
  addons, usage, currency, changeCurrency, money, refetching, refetchPrices,
  isDemo, selectedWorkspaceId, buying, onPick,
}: Props) {
  const { t } = useTranslation();

  return (
    <div>
    <Group justify="space-between" align="center" mb="lg" wrap="wrap">
      <div>
        <Title order={3} style={{ letterSpacing: "-0.01em" }}>{t("billing.addonsTitle")}</Title>
        <Text size="sm" c="dimmed" mt={2}>
          {t("billing.addonsSubtitle")}
        </Text>
      </div>
      <Group gap="sm" wrap="wrap">
        <SegmentedControl
          size="sm"
          radius="md"
          value={currency}
          onChange={(v) => changeCurrency(v as Currency)}
          data={CURRENCIES.map((c) => ({ label: c, value: c }))}
        />
        {/* Refetches the packs *and* the usage behind the credit
            balances below — someone who just spent a credit in another
            tab expects this to move both numbers, not only the price. */}
        <Tooltip label={t("billing.refetchPrices")}>
          <ActionIcon
            variant="light"
            color="gray"
            size="lg"
            radius="md"
            loading={refetching}
            onClick={refetchPrices}
          >
            <RefreshCw size={15} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Group>

    {/* Credits on hand, shown here rather than only in the usage panel
        above: on the tab where someone is deciding whether to buy more,
        what they already have is the deciding number. */}
    {usage && (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mb="lg">
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
      </SimpleGrid>
    )}

    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {addons.map((pack) => (
        <Card key={pack._id} withBorder radius="lg" padding="lg">
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <div>
              <Text fw={650} size="md">{pack.name}</Text>
              <Text size="sm" c="dimmed" mt={2}>
                {t("billing.packQuantity", {
                  n: pack.quantity,
                  type: creditType(t, pack.type, pack.quantity),
                })}
              </Text>
            </div>
            <ThemeIcon size={38} radius="md" variant="light" color="emerald">
              <PackIcon type={pack.type} size={17} />
            </ThemeIcon>
          </Group>
          <Divider my="md" />
          <Group justify="space-between" align="center">
            <Text fz={22} fw={700} style={{ letterSpacing: "-0.02em" }}>{money(priceIn(pack.price, currency))}</Text>
            <Button
              size="sm"
              radius="md"
              variant="outline"
              color="emerald"
              disabled={isDemo || !selectedWorkspaceId}
              loading={buying === pack._id}
              onClick={() => onPick(pack)}
            >
              {isDemo ? t("billing.ctaSignUpBuy") : t("billing.ctaBuy")}
            </Button>
          </Group>
        </Card>
      ))}
      {!addons.length && (
        <Text size="sm" c="dimmed">{t("billing.noAddons")}</Text>
      )}
    </SimpleGrid>
    </div>
  );
}
