import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Badge,
  Box,
  Button,
  Group,
  Progress,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { ArrowUpRight, Eye, LogOut, PlayCircle, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PlanIcon } from "@/features/billing/components/PlanIcons";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
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

/**
 * The way into Orbit, as a card rather than a navigation row.
 *
 * It sits with the cards at the foot of the rail because it is not one of the
 * reports — it is the thing you ask when you do not yet know which report you
 * want. As a one-row "Assistant" group at the top of the list it read as a
 * section someone had forgotten to finish filling in.
 *
 * Collapsed it falls back to the same icon row as the other rail actions, so
 * the assistant is still one click away at that width.
 */
export function OrbitCard({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const label = t("nav.orbit", "Orbit AI");

  // Nothing to advertise once you are already there — on Orbit's own page the
  // card is a button that goes nowhere.
  const onOrbit = pathname.startsWith("/app/orbit");

  /*
   * Kept mounted for one beat after arriving on Orbit, so it can fly out.
   *
   * Unmounting on the route change would make the card vanish between frames.
   * `leaving` runs the exit; `gone` drops it once the exit has finished.
   *
   * Both are seeded from the current route, and the exit only runs on an
   * actual transition into Orbit — `wasOnOrbit` is what distinguishes that
   * from landing on the page directly. Without it, opening /app/orbit in a
   * fresh tab flashed the card in just to animate it straight back out.
   */
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(onOrbit);
  const wasOnOrbit = useRef(onOrbit);

  useEffect(() => {
    const arriving = onOrbit && !wasOnOrbit.current;
    wasOnOrbit.current = onOrbit;

    if (!onOrbit) {
      setLeaving(false);
      setGone(false);
      return;
    }

    // Already here when this mounted: stay hidden, with nothing to animate.
    if (!arriving) {
      setGone(true);
      return;
    }

    setLeaving(true);
    const timer = setTimeout(() => {
      setLeaving(false);
      setGone(true);
    }, 500);
    return () => clearTimeout(timer);
  }, [onOrbit]);

  if (gone) return null;

  if (collapsed) {
    return (
      <UnstyledButton
        component={Link}
        to="/app/orbit"
        className="nav-link"
        data-collapsed
        data-leaving={leaving || undefined}
        aria-label={label}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          padding: "8px 10px",
          marginBottom: 8,
        }}
      >
        <OrbitMark size={18} />
      </UnstyledButton>
    );
  }

  return (
    <UnstyledButton
      component={Link}
      to="/app/orbit"
      className="rail-orbit"
      data-leaving={leaving || undefined}
      style={{ display: "block", width: "100%", marginBottom: 8 }}
    >
      <Group gap={9} wrap="nowrap" align="flex-start">
        <Box mt={1} style={{ flexShrink: 0 }}>
          <OrbitMark size={20} />
        </Box>
        <Box style={{ minWidth: 0, flex: 1 }}>
          <Text size="xs" fw={700} lh={1.3} truncate>
            {label}
          </Text>
          {/* Says what it does rather than naming the page — the row it
              replaced in the navigation list already said the name twice. */}
          <Text size="xs" lh={1.35} mt={1} c="dimmed">
            {t("nav.orbitHint", "Ask anything about your analytics")}
          </Text>
        </Box>
      </Group>
    </UnstyledButton>
  );
}

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

/*
 * The theme and language toggles that used to ride on this row are gone with
 * it. Both are in the account menu at the foot of the rail, which is where a
 * preference belongs.
 */

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

  // Nothing while the plan is healthy: the workspace header at the top of the
  // rail already names the tier and its icon, so a card down here repeating it
  // was the same fact twice. This one appears only when there is something to
  // say — a lapsed plan, or a quota about to run out.
  if (!nudge) return null;

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
