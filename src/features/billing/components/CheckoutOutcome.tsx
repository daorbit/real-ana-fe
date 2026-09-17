import { Modal, Title, Text, Button, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { creditType } from "../lib/credits";
import type { Celebration } from "../hooks/useCheckout";
import cancelledBanner from "@/assets/banners/checkout-cancelled-banner.png";
import successBanner from "@/assets/banners/checkout-success-banner.png";

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
    padding={0}
    withCloseButton={false}
    size={440}
  >
    <Stack gap={0}>
      <div
        style={{
          height: 154,
          backgroundImage: `url(${cancelledBanner})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderTopLeftRadius: "var(--mantine-radius-lg)",
          borderTopRightRadius: "var(--mantine-radius-lg)",
        }}
      />
      <Stack align="center" gap="sm" px={26} py={24}>
        <Text size="sm" c="dimmed" ta="center" maw={300}>
          {cancelled
            ? t("billing.cancelledBodyNamed", { what: cancelled })
            : t("billing.cancelledBody")}
        </Text>
        <Button fullWidth variant="light" color="gray" radius="md" mt="xs" onClick={() => setCancelled(null)}>
          {t("common.close")}
        </Button>
      </Stack>
    </Stack>
  </Modal>

  <Modal
    opened={!!celebration}
    onClose={() => setCelebration(null)}
    centered
    radius="lg"
    padding={0}
    withCloseButton={false}
    size={440}
  >
    {celebration && (
      <Stack gap={0}>
        <div
          style={{
            height: 154,
            backgroundImage: `url(${successBanner})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderTopLeftRadius: "var(--mantine-radius-lg)",
            borderTopRightRadius: "var(--mantine-radius-lg)",
          }}
        />
        <Stack align="center" gap="sm" px={26} py={24}>
          <Title order={4} ta="center" style={{ letterSpacing: "-0.01em" }}>
            {celebration.kind === "plan"
              ? t("billing.celebrationPlanTitle")
              : t("billing.celebrationAddonTitle")}
          </Title>
          <Text size="sm" c="dimmed" ta="center" maw={300}>
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
          <Button fullWidth color="emerald" radius="md" mt="xs" onClick={() => setCelebration(null)}>
            {t("billing.letsGo")}
          </Button>
        </Stack>
      </Stack>
    )}
  </Modal>
    </>
  );
}
