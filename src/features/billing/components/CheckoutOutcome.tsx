import { Modal, Title, Text, Button, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { Celebration } from "../hooks/useCheckout";
import { CircleX } from "lucide-react";
import { CelebrationModal } from "./CelebrationModal";

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
      <Stack align="center" gap="sm" px={26} pt={32} pb={24}>
        <CircleX size={40} strokeWidth={1.6} color="var(--muted)" />
        <Title order={4} ta="center">
          {t("billing.cancelledTitle", "Payment cancelled")}
        </Title>
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

  <CelebrationModal celebration={celebration} onClose={() => setCelebration(null)} />
    </>
  );
}
