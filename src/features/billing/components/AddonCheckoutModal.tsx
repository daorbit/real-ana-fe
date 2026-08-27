import { useEffect, useState } from "react";
import {
  Modal, Text, Group, Button, Stack, Divider, ThemeIcon,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { ShoppingCart, Tag } from "lucide-react";
import { PackIcon, creditType } from "../lib/credits";
import { MIN_CHARGE } from "../lib/constants";
import { PackStepper } from "./PackStepper";
import { CouponField } from "./CouponField";
import { formatMoney, priceIn } from "@/shared/lib/currency";
import type { AddonPack, CouponCheckResult, Currency } from "@/shared/types";

/**
 * Buying one credit pack, in whatever quantity.
 *
 * Same quantity model as the plan dialog, so the two agree on what "× 3" means
 * and on the cap.
 */
export function AddonCheckoutModal({
  pack,
  currency,
  coupon,
  onCoupon,
  busy,
  onClose,
  onConfirm,
}: {
  pack: AddonPack | null;
  currency: Currency;
  coupon: CouponCheckResult | null;
  onCoupon: (result: CouponCheckResult | null) => void;
  busy: boolean;
  onClose: () => void;
  onConfirm: (pack: AddonPack, packs: number) => void;
}) {
  const { t } = useTranslation();
  const [packs, setPacks] = useState(1);

  useEffect(() => {
    if (pack) setPacks(1);
  }, [pack?._id]);

  if (!pack) return <Modal opened={false} onClose={onClose} children={null} />;

  const money = (amountMinor: number) => formatMoney(amountMinor, currency);
  const unit = priceIn(pack.price, currency);
  const subtotal = unit * packs;
  const percentOff = coupon?.coupon?.percentOff ?? 0;
  const total = percentOff ? Math.floor((subtotal * (100 - percentOff)) / 100) : subtotal;
  // Same Razorpay floor the server applies — see MIN_CHARGE.
  const chargeable = Math.max(total, MIN_CHARGE);

  return (
    <Modal
      opened
      onClose={onClose}
      title={<Text fw={700}>{t("billing.confirmPurchase")}</Text>}
      centered
      radius="lg"
    >
      <Stack gap="lg">
        <Group justify="space-between" wrap="nowrap">
          <Group gap={10} wrap="nowrap">
            <ThemeIcon size={38} radius="md" variant="light" color="emerald">
              <PackIcon type={pack.type} size={17} />
            </ThemeIcon>
            <div>
              <Text fw={650}>{pack.name}</Text>
              <Text size="xs" c="dimmed">
                {t("billing.packUnitPerPack", {
                  n: pack.quantity,
                  type: creditType(t, pack.type, pack.quantity),
                  price: money(unit),
                })}
              </Text>
            </div>
          </Group>
        </Group>

        <Group justify="space-between">
          <div>
            <Text size="sm" fw={600}>{t("billing.howManyPacks")}</Text>
            <Text size="xs" c="emerald" fw={600}>
              {t("billing.packTotal", {
                n: pack.quantity * packs,
                type: creditType(t, pack.type, pack.quantity * packs),
              })}
            </Text>
          </div>
          <PackStepper
            value={packs}
            disabled={busy}
            // At least one — this dialog exists to buy something, and a zero
            // here would leave the confirm button doing nothing.
            min={1}
            onChange={setPacks}
          />
        </Group>

        <CouponField amount={subtotal} result={coupon} onChange={onCoupon} />

        <Divider />

        <Stack gap={6}>
          <Group justify="space-between">
            <Text size="sm" c="dimmed">{t("billing.packTimes", { name: pack.name, packs })}</Text>
            <Text size="sm">{money(subtotal)}</Text>
          </Group>

          {percentOff > 0 && (
            <Group justify="space-between">
              <Group gap={6}>
                <Tag size={12} />
                <Text size="sm" c="dimmed">
                  {t("billing.couponOff", { code: coupon?.coupon?.code, percent: percentOff })}
                </Text>
              </Group>
              <Text size="sm" c="emerald">− {money(subtotal - total)}</Text>
            </Group>
          )}

          <Divider my={4} />

          <Group justify="space-between">
            <Text fw={700}>Total</Text>
            <Text fz={24} fw={800} style={{ letterSpacing: "-0.02em" }}>{money(chargeable)}</Text>
          </Group>

          {chargeable > total && (
            <Text size="xs" c="dimmed">
              {t("billing.minimumCharge", { amount: money(MIN_CHARGE) })}
            </Text>
          )}
        </Stack>

        <Text size="xs" c="dimmed">
          {t("billing.addonOneTime")}
        </Text>

        <Group justify="flex-end">
          <Button variant="subtle" onClick={onClose} disabled={busy}>{t("common.cancel")}</Button>
          <Button
            color="emerald"
            leftSection={<ShoppingCart size={15} />}
            loading={busy}
            onClick={() => onConfirm(pack, packs)}
          >
            {t("billing.payAmount", { amount: money(chargeable) })}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
 
