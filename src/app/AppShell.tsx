import { useEffect, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppShell as MantineShell, Box, Burger, Group } from "@mantine/core";
import { useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useTranslation } from "react-i18next";
import { Wordmark } from "@/shared/ui/Brand";
import { OrbitBubble } from "@/features/orbit/components/OrbitBubble";
import { useWorkspace } from "@/features/workspace/context";
import { SwitchOverlay, useSwitchOverlay } from "@/shared/ui/SwitchOverlay";
import { useSyncWorkspaceTheme } from "@/features/auth/components/useSyncWorkspaceTheme";
import { CommandPalette } from "@/shared/ui/CommandPalette";
import { useDemo } from "@/features/demo/context";
import { Rail } from "./shell/Rail";
import { useRailState } from "./shell/useRailState";

/**
 * The frame every signed-in page renders inside: a rail, a panel, and the
 * overlays that belong to neither.
 *
 * Deliberately thin. Everything the rail contains lives in `./shell` — this
 * file decides where the regions sit and how wide they are, and nothing about
 * what is in them.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { active } = useWorkspace();
  const { demo } = useDemo();
  const loc = useLocation();

  // Matches the shell's `breakpoint: "sm"` — below this the navbar is a
  // slide-over rather than a permanent rail, which changes where popovers
  // anchored to it can open without falling off the screen.
  const mobile = useMediaQuery("(max-width: 48em)") ?? false;

  const { collapsed, toggleRail, adminOpen, toggleAdmin } = useRailState(mobile);

  // Switching workspace re-renders every panel with a different dataset at
  // once. The overlay covers that swap; it never gates the fetch.
  const wsSwitch = useSwitchOverlay(active?._id ?? null);

  // Pulls the active workspace's saved Appearance and applies it — see the
  // hook for why this is additive to localStorage rather than the only
  // source of truth.
  useSyncWorkspaceTheme(active?._id);

  // Mobile nav drawer. The navbar is a permanent rail on desktop and a
  // slide-over on phones — close it on every navigation so a tap on a link
  // doesn't leave the overlay covering the page it just opened.
  const [navOpen, { toggle: toggleNav, close: closeNav }] = useDisclosure(false);
  useEffect(() => {
    closeNav();
  }, [loc.pathname, closeNav]);

  return (
    <>
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
          // Wide enough collapsed for a centred 17px icon inside a full-width
          // hit area, and no wider — the point is the pixels it gives back.
          width: collapsed ? 64 : 252,
          breakpoint: "sm",
          collapsed: { mobile: !navOpen },
        }}
        /* The gap between the rail and the panel, and the panel's inset from
           the window edge. Kept tight — this is a frame, not a margin, and
           every pixel here is taken from the content the panel exists to
           show. */
        padding="xs"
      >
        {/* Mobile-only top bar. Hidden on desktop (header collapsed there), it
            carries the burger and brand so the navbar can slide away on
            phones. */}
        <MantineShell.Header
          px="md"
          hiddenFrom="sm"
          style={{ background: "var(--bg)", borderBottom: "1px solid var(--border)" }}
        >
          <Group h="100%" gap="sm">
            <Burger opened={navOpen} onClick={toggleNav} size="sm" aria-label={t("nav.toggleNav")} />
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

        <MantineShell.Main className="app-main" style={{ position: "relative" }}>
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
            <div className="app-panel__scroll">
              {/* Keyed on the path so the entrance animation replays on every
                  navigation rather than only on first mount. */}
              <div key={loc.pathname} className="route-fade">
                {children}
              </div>
              {/* Clear the floating help button so page content never sits
                  under it. The height tracks the button's size, which steps
                  down on phones. */}
              <div className="orbit-fab-spacer" />
            </div>

            {/* Inside the panel rather than the viewport: it is anchored to the
                content's own bottom-right corner, and pinned to the window it
                would have floated over the panel's edge. */}
            <OrbitBubble />
          </div>
        </MantineShell.Main>
      </MantineShell>
    </>
  );
}
