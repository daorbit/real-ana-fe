import { Link } from "react-router-dom";
import { Badge, Box, Button, Group, Progress, Text, ThemeIcon, UnstyledButton } from "@mantine/core";
import { ArrowUpRight, Eye, LogOut, PlayCircle, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PlanIcon } from "@/features/billing/components/PlanIcons";
import { useAuth } from "@/features/auth/context";
import { useActiveBilling } from "@/features/workspace/context";
import { NavAction } from "./NavLink";

/**
 * The cards above the account tile.
 *
 * All of them are prose — an invitation, a quota, an explanation — and none of
 * it survives being squeezed into 44px. Collapsed, the two that merely inform
 * are dropped, and the two that warn shrink to an icon instead: a session
 * standing in for a real customer, and a read-only demo, are not things the
 * rail may stop saying to save space.
 */

/** An outstanding invitation, one at a time. */
export function PendingInviteCard() {
  const { user } = useAuth();
  const invites = user?.pendingInvites ?? [];
  if (!invites.length) return null;

  // One at a time. Someone with three outstanding invitations still accepts
  // them one by one, and a stack of cards would crowd out the navigation.
  const [invite] = invites;

  return (
    <UnstyledButton
      component={Link}
      to={`/invite/${invite.token}`}
      className="tile"
      style={{ display: "block", width: "100%", padding: "10px 12px", marginBottom: 8 }}
    >
      <Group gap={8} wrap="nowrap" align="flex-start">
        <ThemeIcon size={20} radius="xl" variant="light" color="emerald">
          <UserPlus size={11} />
        </ThemeIcon>
        <div style={{ minWidth: 0 }}>
          <Text size="xs" fw={600} lh={1.3}>
            You&apos;ve been invited
          </Text>
          <Text size="xs" c="dimmed" lh={1.35} truncate>
            {invite.workspaceName} · {invite.role}
          </Text>
          {invites.length > 1 && (
            <Text size="xs" c="dimmed" lh={1.35}>
              +{invites.length - 1} more
            </Text>
          )}
        </div>
      </Group>
    </UnstyledButton>
  );
}

/**
 * Standing in for a real customer.
 *
 * Full access means an accidental delete lands on someone's live account, so
 * the session stays flagged for as long as it lasts. It sits directly above the
 * account it is standing in for — a banner over the page pushed every screen
 * down to say something that never changes.
 */
export function ImpersonationCard({
  collapsed,
  email,
  leaving,
  onLeave,
}: {
  collapsed: boolean;
  email: string;
  leaving: boolean;
  onLeave: () => void;
}) {
  const { t } = useTranslation();

  if (collapsed) {
    return (
      <NavAction
        collapsed
        icon={Eye}
        color="var(--amber)"
        label={t("nav.exit")}
        tooltip={`${t("nav.viewingAs")} ${email} — ${t("nav.exit")}`}
        onClick={onLeave}
        disabled={leaving}
        mb={8}
      />
    );
  }

  return (
    <Box className="impersonation-card" mb="xs">
      <Group gap={6} wrap="nowrap" mb={4}>
        <Eye size={12} style={{ color: "var(--amber)", flexShrink: 0 }} />
        <Text size="xs" fw={650}>{t("nav.viewingAs")}</Text>
      </Group>
      <Text size="xs" c="dimmed" lh={1.4} truncate title={email}>
        {email}
      </Text>
      <UnstyledButton className="impersonation-exit" onClick={onLeave} disabled={leaving}>
        <LogOut size={11} />
        {t("nav.exit")}
      </UnstyledButton>
    </Box>
  );
}

/**
 * A read-only demo session.
 *
 * A persistent card, not a toast, because it explains why every action is
 * disabled — and it is the way out.
 */
export function DemoCard({ collapsed, onExit }: { collapsed: boolean; onExit: () => void }) {
  const { t } = useTranslation();

  if (collapsed) {
    return (
      <NavAction
        collapsed
        icon={PlayCircle}
        color="var(--violet-2)"
        label={t("nav.exitDemo")}
        tooltip={`${t("nav.demoMode")} — ${t("nav.exitDemo")}`}
        onClick={onExit}
        mb={8}
      />
    );
  }

  return (
    <Box className="demo-card" mb="xs">
      <Group gap={6} wrap="nowrap" mb={4}>
        <PlayCircle size={12} style={{ color: "var(--violet-2)", flexShrink: 0 }} />
        <Text size="xs" fw={650}>{t("nav.demoMode")}</Text>
      </Group>
      <Text size="xs" c="dimmed" lh={1.4}>
        {t("nav.demoBlurb")}
      </Text>
      <UnstyledButton className="demo-exit" onClick={onExit}>
        <LogOut size={11} />
        {t("nav.exitDemo")}
      </UnstyledButton>
    </Box>
  );
}

/** The active workspace's plan — plans are bought per workspace, not per account. */
export function PlanCard() {
  const billing = useActiveBilling();
  if (!billing) return null;

  const expired = billing.status === "expired";

  // The tightest of the two usage ratios is what decides whether this nudges
  // — a plan can have plenty of crawl headroom left while audits are nearly
  // exhausted, and that's the number that should drive the warning.
  const auditPct = billing.audits.planQuota > 0
    ? billing.audits.used / billing.audits.planQuota
    : 1;
  const crawlPct = billing.crawls.planQuota > 0
    ? billing.crawls.used / billing.crawls.planQuota
    : 1;
  const worstPct = Math.max(auditPct, crawlPct);
  const nearLimit = worstPct >= 0.8
    && billing.audits.addonCredits === 0
    && billing.crawls.addonCredits === 0;

  const nudge = expired || nearLimit;

  if (!nudge) {
    return (
      <UnstyledButton
        component={Link}
        to="/app/billing"
        className="tile"
        style={{ display: "block", width: "100%", padding: "8px 10px", marginBottom: 8 }}
      >
        <Group justify="space-between" wrap="nowrap">
          <Group gap={6} wrap="nowrap">
            <PlanIcon slug={billing.plan.slug} size={16} uid="rail" />
            <Text size="xs" fw={600} truncate>{billing.plan.name} plan</Text>
          </Group>
          <Badge size="xs" variant="light" color="gray" tt="none">{billing.cycle}</Badge>
        </Group>

        {/* No usage bar while there is room: unlabelled, it reads as a stray
            rule under the plan name rather than as a quota, and the card that
            replaces this one the moment a limit is close says it in words. */}
      </UnstyledButton>
    );
  }

  return (
    <Box className="tile" style={{ padding: 10, marginBottom: 8 }}>
      <Group justify="space-between" wrap="nowrap" mb={6}>
        <Group gap={6} wrap="nowrap">
          <PlanIcon slug={billing.plan.slug} size={16} uid="rail-warn" />
          <Text size="xs" fw={650}>{billing.plan.name} plan</Text>
        </Group>
        {expired && (
          <Badge size="xs" variant="light" color="red" tt="none">expired</Badge>
        )}
      </Group>

      {expired ? (
        <Text size="xs" c="dimmed" lh={1.4} mb={8}>
          Your period ended — audits and crawls are paused until you renew.
        </Text>
      ) : (
        <>
          <Text size="xs" c="dimmed" lh={1.4} mb={6}>
            You've used {billing.audits.used}/{billing.audits.planQuota} audits and{" "}
            {billing.crawls.used}/{billing.crawls.planQuota} crawls this cycle.
          </Text>
          <Progress value={worstPct * 100} size={4} radius="xl" color="yellow" mb={8} />
        </>
      )}

      <Button
        component={Link}
        to="/app/billing"
        size="compact-xs"
        fullWidth
        color={expired ? "red" : "emerald"}
        variant={expired ? "filled" : "light"}
        rightSection={<ArrowUpRight size={12} />}
      >
        {expired ? "Renew plan" : "Upgrade plan"}
      </Button>
    </Box>
  );
}
