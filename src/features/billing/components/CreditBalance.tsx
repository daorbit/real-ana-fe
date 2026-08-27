import { Card, Group, Text, Badge, Box } from "@mantine/core";
import { useTranslation } from "react-i18next";

/**
 * What's left to spend, split by where it came from.
 *
 * Plan quota and addon credits are kept apart rather than summed because they
 * behave differently: the plan's share resets at the end of the period and the
 * bought credits don't. A single total would hide the only fact that matters
 * when deciding whether to buy more.
 */
export function CreditBalance({
  icon: Icon,
  label,
  planLeft,
  addonCredits,
}: {
  /**
   * A lucide icon, or the Orbit mark — which takes only `size`, so anything
   * rendered here must not depend on the icon accepting `style`.
   */
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  planLeft: number;
  addonCredits: number;
}) {
  const { t } = useTranslation();
  const total = planLeft + addonCredits;
  return (
    <Card withBorder radius="md" padding="md" className="static-card">
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <div>
          <Group gap={6} mb={4}>
            {/* Colour on the wrapper rather than the icon: a lucide glyph
                inherits `currentColor`, and the Orbit mark — which is a logo,
                not a glyph — correctly ignores it. */}
            <Box component="span" c="dimmed" display="inline-flex">
              <Icon size={13} />
            </Box>
            <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.02em" }}>
              {label}
            </Text>
          </Group>
          <Text fz={26} fw={800} style={{ letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {total}
          </Text>
          <Text size="xs" c="dimmed" mt={2}>
            {addonCredits > 0
              ? t("billing.creditsBought", { planLeft, addonCredits })
              : t("billing.creditsFromPlan", { planLeft })}
          </Text>
        </div>
        {total === 0 && (
          <Badge size="sm" variant="light" color="red" tt="none">{t("billing.out")}</Badge>
        )}
      </Group>
    </Card>
  );
}
