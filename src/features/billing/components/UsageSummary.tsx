import {
  Card, Text, Group, Badge, Box, SimpleGrid, Progress, Alert,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import {
  Activity, Search, Globe2, Layers, Info, Clock, ClipboardList,
} from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { PlanIcon } from "@/features/billing/components/PlanIcons";
import type { QuotaSummary } from "@/shared/types";

/**
 * The hero usage panel: current plan, renewal date, and progress toward each
 * quota. Sits above the pricing grid so "what am I on, and how close to the
 * edge" is answered before "what could I switch to."
 */
export function UsageSummary({
  usage,
  expired,
}: {
  usage: NonNullable<QuotaSummary>;
  expired: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Card
      withBorder
      radius="lg"
      padding={0}
      style={{ overflow: "hidden" }}
    >
      {/* The header carries the card's own top radius rather than leaning on
          the parent's `overflow: hidden` to cut it. Clipping happens at the
          border box, so a square fill under a rounded border shaves the border
          itself at each top corner — the curve ends up a shade of the fill
          instead of the border colour. Rounding the fill leaves the border
          intact and the two curves concentric. */}
      <Box
        p="lg"
        style={{
          background: expired
            ? "color-mix(in srgb, var(--mantine-color-red-6) 8%, transparent)"
            : "linear-gradient(135deg, color-mix(in srgb, var(--violet-2) 10%, transparent), transparent)",
          borderBottom: "1px solid var(--border)",
          borderStartStartRadius: "var(--mantine-radius-lg)",
          borderStartEndRadius: "var(--mantine-radius-lg)",
        }}
      >
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <Group gap="sm" wrap="nowrap">
            <Box
              style={{
                width: 44, height: 44, borderRadius: 10, display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "var(--bg-2)", border: "1px solid var(--border)",
              }}
            >
              <PlanIcon slug={usage.plan.slug} size={26} uid="hero" />
            </Box>
            <div>
              <Group gap={8}>
                <Text fw={700} size="lg">{t("billing.planNamed", { plan: usage.plan.name })}</Text>
                <Badge size="sm" variant="light" color={expired ? "red" : "emerald"} tt="none">
                  {expired ? t("billing.statusExpired") : t("billing.statusActive")}
                </Badge>
              </Group>
              {usage.currentPeriodEnd && (
                <Group gap={5} mt={2}>
                  <Clock size={12} style={{ color: "var(--muted, var(--mantine-color-dimmed))" }} />
                  <Text size="xs" c="dimmed">
                    {t(expired ? "billing.expiredOn" : "billing.renewsOn", {
                      date: new Date(usage.currentPeriodEnd).toLocaleDateString(undefined, {
                        day: "numeric", month: "short", year: "numeric",
                      }),
                    })}
                    {t("billing.billedSuffix", {
                      cycle: t(
                        usage.cycle === "yearly"
                          ? "billing.cycleYearlyWord"
                          : "billing.cycleMonthlyWord",
                      ),
                    })}
                  </Text>
                </Group>
              )}
            </div>
          </Group>
        </Group>
      </Box>

      {expired && (
        <Box p="md" style={{ borderBottom: "1px solid var(--border)" }}>
          <Alert variant="light" color="red" icon={<Info size={16} />} radius="md" p="sm">
            <Text size="sm">
              {t("billing.expiredNotice")}
            </Text>
          </Alert>
        </Box>
      )}

      {/* Workspaces are no longer an allowance to spend — an account may have as
          many as it pays for — so the panel reports this workspace's own audits,
          crawls, sites, and the Orbit questions its plan includes. */}
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 4 + (usage.orbit ? 1 : 0) + (usage.forms ? 1 : 0) }}
        spacing={0}
      >
        {/* First: it is the meter that decides whether tracking keeps working,
            where the rest cap features the customer opts into. */}
        <UsageCell icon={Activity} label={t("billing.usageEvents")} used={usage.events.used} quota={usage.events.planQuota} />
        <UsageCell icon={Search} label={t("billing.usageAudits")} used={usage.audits.used} quota={usage.audits.planQuota} credits={usage.audits.addonCredits} />
        <UsageCell icon={Globe2} label={t("billing.usageCrawls")} used={usage.crawls.used} quota={usage.crawls.planQuota} credits={usage.crawls.addonCredits} />
        <UsageCell icon={Layers} label={t("billing.usageSites")} used={usage.sites.used} quota={usage.sites.quota} />
        {usage.orbit && (
          <UsageCell icon={OrbitMark} label={t("billing.usageOrbit")} used={usage.orbit.used} quota={usage.orbit.planQuota} credits={usage.orbit.addonCredits} />
        )}
        {/* Responses rather than forms: this is the meter that runs out and
            stops a form collecting, where the form cap is a number the builder
            reports when it refuses. */}
        {usage.forms && (
          <UsageCell
            icon={ClipboardList}
            label={t("billing.usageFormResponses")}
            used={usage.forms.submissionsUsed}
            quota={usage.forms.submissionQuota}
            credits={usage.forms.addonCredits}
          />
        )}
      </SimpleGrid>
    </Card>
  );
}

function UsageCell({
  icon: Icon, label, used, quota, credits,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  used: number | null;
  quota: number;
  credits?: number;
}) {
  const { t } = useTranslation();
  const total = quota + (credits ?? 0);
  const pct = used === null ? null : total > 0 ? Math.min(100, (used / total) * 100) : 100;
  const exhausted = pct !== null && pct >= 100;
  return (
    <Box p="lg" style={{ borderRight: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}>
      <Group gap={6} mb={8}>
        <Box component="span" c="dimmed" display="inline-flex">
          <Icon size={14} />
        </Box>
        <Text size="xs" c="dimmed" fw={600} tt="uppercase" style={{ letterSpacing: "0.02em" }}>{label}</Text>
      </Group>
      {used === null ? (
        <Text fz={22} fw={700} style={{ letterSpacing: "-0.02em" }}>{quota}</Text>
      ) : (
        <>
          <Group gap={6} align="baseline">
            <Text fz={22} fw={700} style={{ letterSpacing: "-0.02em" }}>{used}</Text>
            <Text size="sm" c="dimmed">/ {total}</Text>
          </Group>
          {credits ? (
            <Text size="xs" c="dimmed" mt={2}>{t("billing.planPlusAddon", { quota, credits })}</Text>
          ) : null}
          <Progress value={pct ?? 0} color={exhausted ? (credits ? "yellow" : "red") : "emerald"} size={4} radius="xl" mt={8} />
        </>
      )}
    </Box>
  );
}
