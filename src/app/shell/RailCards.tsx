import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { isPlainLeftClick, supportsViewTransitions, transitionTo } from "@/app/viewTransition";

/** Matches the `rail-orbit-fade-out` keyframes' duration in App.css. */
const FLY_OUT_MS = 320;

export function OrbitCard({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const label = t("nav.orbit", "Orbit AI");

  // Nothing to advertise once you are already there — on Orbit's own page the
  // card is a button that goes nowhere.
  const onOrbit = pathname.startsWith("/app/orbit");

  const [leaving, setLeaving] = useState(false);

  const go = (e: React.MouseEvent) => {
    // A modified click (open in new tab, open in background, middle-click) or
    // anything but the plain left button should still behave like an ordinary
    // link — only a normal click gets the animated hand-off.
    if (!isPlainLeftClick(e)) return;
    e.preventDefault();
    if (leaving) return; // already on the way out — a second click does nothing new
    if (supportsViewTransitions()) {
      transitionTo(navigate, "/app/orbit", "orbit");
      return;
    }
    setLeaving(true);
    setTimeout(() => navigate("/app/orbit"), FLY_OUT_MS);
  };

  // Nothing to fly out of on Orbit's own page — the card simply is not drawn.
  if (onOrbit) return null;

  if (collapsed) {
    return (
      <UnstyledButton
        component={Link}
        to="/app/orbit"
        onClick={go}
        className="nav-link rail-orbit-mini"
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
      onClick={go}
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
