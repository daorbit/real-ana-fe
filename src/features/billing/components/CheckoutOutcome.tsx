import { Modal, Title, Text, Button, Stack, ThemeIcon } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { X, PartyPopper } from "lucide-react";
import { creditType } from "../lib/credits";
import type { Celebration } from "../hooks/useCheckout";

interface Props {
  /** What was abandoned at the payment sheet, if anything. */
  cancelled: string | null;
  setCancelled: (value: string | null) => void;
  celebration: Celebration | null;
  setCelebration: (value: Celebration | null) => void;
}

/**
 * How a checkout ends, either way.
 *
 * The two are one component because they are the same moment from the page's
 * point of view — the sheet closed, and exactly one of these is true.
 */
export function CheckoutOutcome({ cancelled, setCancelled, celebration, setCelebration }: Props) {
  const { t } = useTranslation();

  return (
    <>
  <Modal
    opened={!!cancelled}
    onClose={() => setCancelled(null)}
    centered
    radius="lg"
    withCloseButton={false}
    size="sm"
  >
    <Stack align="center" gap="sm" py="md">
      <ThemeIcon size={56} radius="xl" variant="light" color="gray">
        <X size={26} />
      </ThemeIcon>
      <Title order={3} ta="center" style={{ letterSpacing: "-0.01em" }}>
        {t("billing.cancelledTitle")}
      </Title>
      <Text size="sm" c="dimmed" ta="center" maw={280}>
        {cancelled
          ? t("billing.cancelledBodyNamed", { what: cancelled })
          : t("billing.cancelledBody")}
      </Text>
      <Button variant="light" color="gray" radius="md" mt="sm" onClick={() => setCancelled(null)}>
        {t("common.close")}
      </Button>
    </Stack>
  </Modal>

  <Modal
    opened={!!celebration}
    onClose={() => setCelebration(null)}
    centered
    radius="lg"
    withCloseButton={false}
    size="sm"
  >
    {celebration && (
      <Stack align="center" gap="sm" py="md">
        <ThemeIcon size={56} radius="xl" variant="light" color="emerald">
          <PartyPopper size={26} />
        </ThemeIcon>
        <Title order={3} ta="center" style={{ letterSpacing: "-0.01em" }}>
          {celebration.kind === "plan"
            ? t("billing.celebrationPlanTitle")
            : t("billing.celebrationAddonTitle")}
        </Title>
        <Text size="sm" c="dimmed" ta="center" maw={280}>
          {celebration.kind === "plan" ? (
            <>
              {t("billing.celebrationPlanBody", { plan: celebration.planName })}
              {celebration.credits.length > 0 &&
                t("billing.celebrationPlanExtra", {
                  extras: celebration.credits
                    .map((c) => `${c.credits} ${creditType(t, c.type, c.credits)}`)
                    .join(t("billing.and")),
                })}
            </>
          ) : (
            t("billing.celebrationAddonBody", {
              n: celebration.pack.quantity * celebration.packs,
              type: creditType(
                t,
                celebration.pack.type,
                celebration.pack.quantity * celebration.packs,
              ),
            })
          )}
        </Text>
        <Button color="emerald" radius="md" mt="sm" onClick={() => setCelebration(null)}>
          {t("billing.letsGo")}
        </Button>
      </Stack>
    )}
  </Modal>
    </>
  );
}
