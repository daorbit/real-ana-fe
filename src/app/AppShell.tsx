import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AppShell as MantineShell, Box, Burger, Group } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { Wordmark } from "@/shared/ui/Brand";
import { useWorkspace } from "@/features/workspace/context";
import { SwitchOverlay, useSwitchOverlay } from "@/shared/ui/SwitchOverlay";
import { useSyncWorkspaceTheme } from "@/features/auth/components/useSyncWorkspaceTheme";
import { CommandPalette } from "@/shared/ui/CommandPalette";
import { QuotaNudge } from "@/shared/ui/QuotaNudge";
import { PlanExpiryNotice } from "@/shared/ui/PlanExpiryNotice";
import { OfflineBar } from "@/shared/ui/OfflineBar";
import { FetchProgress } from "@/shared/ui/FetchProgress";
import { useDemo } from "@/features/demo/context";
import { Starfield } from "@/shared/ui/Starfield";
import { BG_STYLES, readThemePrefs } from "@/shared/lib/theme";
import { ActivityPanelProvider } from "@/features/activity/ActivityPanelContext";
import { Rail } from "./shell/Rail";
import { useRailState } from "./shell/useRailState";

function useStarfieldPreset(): boolean {
  const [on, setOn] = useState(
    () => BG_STYLES.find((b) => b.id === readThemePrefs().bg)?.kind === "stars",
  );
  useEffect(() => {
    const sync = () =>
      setOn(
        BG_STYLES.find((b) => b.id === readThemePrefs().bg)?.kind === "stars",
      );

    window.addEventListener("quantalog-theme-change", sync);
    return () => window.removeEventListener("quantalog-theme-change", sync);
  }, []);
  return on;
}

function useRouteMotionOff(): boolean {
  const osReduced = () =>
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const [off, setOff] = useState(() => !readThemePrefs().motion || osReduced());
  useEffect(() => {
    const sync = () => setOff(!readThemePrefs().motion || osReduced());
    window.addEventListener("quantalog-theme-change", sync);
    const mq = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    mq?.addEventListener("change", sync);
    return () => {
      window.removeEventListener("quantalog-theme-change", sync);
      mq?.removeEventListener("change", sync);
    };
  }, []);
  return off;
}

export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { active } = useWorkspace();
  const { demo } = useDemo();
  const loc = useLocation();

  const mobile = useMediaQuery("(max-width: 48em)") ?? false;

  const { collapsed, toggleRail, adminOpen, toggleAdmin } =
    useRailState(mobile);

  const wsSwitch = useSwitchOverlay(active?._id ?? null);
  const stars = useStarfieldPreset();
  const motionOff = useRouteMotionOff();

  const scroller = useRef<HTMLDivElement>(null);

  useSyncWorkspaceTheme(active?._id);
  const [navOpen, { toggle: toggleNav, close: closeNav }] =
    useDisclosure(false);
  useEffect(() => {
    closeNav();
  }, [loc.pathname, closeNav]);

  return (
    <ActivityPanelProvider>
      <OfflineBar />
      <FetchProgress />
      <CommandPalette />
      {wsSwitch.active && active && (
        <SwitchOverlay
          label={active.name}
          sublabel={t("nav.loadingWorkspace")}
          onDone={wsSwitch.dismiss}
        />
      )}
      <MantineShell
        header={{ height: { base: 56, sm: 0 } }}
        navbar={{
          width: collapsed ? 72 : 264,
          breakpoint: "sm",
          collapsed: { mobile: !navOpen },
        }}
        padding="sm"
      >
        <MantineShell.Header
          px="md"
          hiddenFrom="sm"
          style={{
            background: "var(--bg)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Group h="100%" gap="sm">
            <Burger
              opened={navOpen}
              onClick={toggleNav}
              size="sm"
              aria-label={t("nav.toggleNav")}
            />
            <Box component={Link} to="/app" display="flex">
              <Wordmark />
            </Box>
          </Group>
        </MantineShell.Header>

        <Rail
          pathname={loc.pathname}
          collapsed={collapsed}
          mobile={mobile}
          onToggleRail={toggleRail}
          adminOpen={adminOpen}
          onToggleAdmin={toggleAdmin}
        />

        <MantineShell.Main
          id="main-content"
          className="app-main"
          style={{ position: "relative" }}
        >
          {demo && (
            <Box
              aria-hidden
              style={{
                position: "fixed",
                insetInline: 0,
                top: 0,
                height: 2,
                background: "var(--mantine-color-violet-5)",
                zIndex: 200,
              }}
            />
          )}

          <div className="app-panel">
            {/* Inside the panel so it is clipped to the panel's radius and
                bounded by its border, exactly like the other backgrounds. */}
            {stars && (
              <Starfield variant="app" count={70} scrollTarget={scroller} />
            )}
            <div className="app-panel__scroll" ref={scroller}>
              <PlanExpiryNotice />
              <QuotaNudge />
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={loc.pathname}
                  className="route-fade"
                  initial={motionOff ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={motionOff ? undefined : { opacity: 0, y: -6 }}
                  transition={
                    motionOff
                      ? { duration: 0 }
                      : { duration: 0.22, ease: [0.16, 1, 0.3, 1] }
                  }
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>

            <div id="panel-overlay-root" />
          </div>
        </MantineShell.Main>
      </MantineShell>
    </ActivityPanelProvider>
  );
}
