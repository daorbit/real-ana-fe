import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Box, Group, Text, ThemeIcon, Tooltip, UnstyledButton } from "@mantine/core";
import { LogOut, PlayCircle, UserPlus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { useAuth } from "@/features/auth/context";
import { NavAction } from "./NavLink";
import { isPlainLeftClick, supportsViewTransitions, transitionTo } from "@/app/viewTransition";
import classes from "./Rail.module.css";

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

  useEffect(() => {
    setLeaving(false);
  }, [pathname]);

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
      <Tooltip label={label} position="right" withArrow openDelay={200}>
        <UnstyledButton
          component={Link}
          to="/app/orbit"
          onClick={go}
          className={`rail-orbit-mini ${classes.orbit}`}
          data-collapsed
          data-leaving={leaving || undefined}
          aria-label={label}
        >
          <span className={classes.orbitIcon}><OrbitMark size={22} /></span>
        </UnstyledButton>
      </Tooltip>
    );
  }

  return (
    <UnstyledButton
      component={Link}
      to="/app/orbit"
      onClick={go}
      className={`rail-orbit ${classes.orbit}`}
      data-leaving={leaving || undefined}
    >
      <span className={classes.orbitIcon}><OrbitMark size={22} /></span>
      <span className={classes.orbitText}>
        <span className={classes.orbitTitle}>{label}</span>
        <span className={classes.orbitHint}>{t("nav.orbitHint", "Ask anything about your analytics")}</span>
      </span>
      <span className={classes.orbitKbd}>AI</span>
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
