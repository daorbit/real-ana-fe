import { ActionIcon, AppShell as MantineShell, Box, Group, ScrollArea } from "@mantine/core";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth, useIsPlatformAdmin } from "@/features/auth/context";
import { useDemo } from "@/features/demo/context";
import { notify, errMessage } from "@/shared/lib/notify";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { useState } from "react";
import { RailBrand } from "./RailBrand";
import { SearchButton } from "./SearchButton";
import { NavGroups } from "./NavGroups";
import { RailWorkspaceHeader } from "./RailWorkspaceHeader";
import { AccountMenu } from "./AccountMenu";
import { DemoCard, ImpersonationCard, OrbitCard, PlanCard } from "./RailCards";
import { NAV_GROUPS } from "./navItems";
import { LogoutDialog } from "./LogoutDialog";

 
export function Rail({
  pathname,
  collapsed,
  mobile,
  onToggleRail,
  adminOpen,
  onToggleAdmin,
  onCloseNav,
}: {
  pathname: string;
  collapsed: boolean;
  mobile: boolean;
  onToggleRail: () => void;
  adminOpen: boolean;
  onToggleAdmin: () => void;
  onCloseNav: () => void;
}) {
  const { t } = useTranslation();
  const { user, logout, exitImpersonation, isDemo } = useAuth();
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme("light");
  const dark = scheme === "dark";

  const { demo, available: demoAvailable, toggle: toggleDemo } = useDemo();

  const [logoutOpen, setLogoutOpen] = useState(false);

  const impersonating = Boolean(user?.impersonating);
  // Super-admin only, and never while impersonating — see `useIsPlatformAdmin`.
  const isAdmin = useIsPlatformAdmin();
  const [leaving, setLeaving] = useState(false);

  const initials = (user?.firstName || user?.name || "?").slice(0, 2).toUpperCase();
  // The admin rows live in the account menu now, not the rail — a regular
  // member should never see navigation they cannot use.
  const groups = NAV_GROUPS;

  const leave = async () => {
    setLeaving(true);
    try {
      await exitImpersonation();
      notify.info(t("nav.backToAccount"));
    } catch (e) {
      notify.error(errMessage(e, t("nav.exitImpersonationError")));
    } finally {
      setLeaving(false);
    }
  };

  return (
    <MantineShell.Navbar p="md">

      <MantineShell.Section visibleFrom="sm" mb="md">
        <Group gap={4} wrap="nowrap" align="center">
      
          {!collapsed && (
            <Box style={{ minWidth: 0, flex: 1 }}>
              <RailWorkspaceHeader collapsed={collapsed} />
            </Box>
          )}
          <RailBrand collapsed={collapsed} onToggle={onToggleRail} />
        </Group>
      </MantineShell.Section>

      {/* In the mobile drawer there is no collapse control to share a line
          with, so the workspace row gets a close button in its place. */}
      <MantineShell.Section hiddenFrom="sm" mb="md">
        <Group gap={4} wrap="nowrap" align="center">
          <Box style={{ minWidth: 0, flex: 1 }}>
            <RailWorkspaceHeader collapsed={collapsed} />
          </Box>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="md"
            onClick={onCloseNav}
            aria-label={t("nav.closeNav", "Close navigation")}
          >
            <X size={18} />
          </ActionIcon>
        </Group>
      </MantineShell.Section>

      <MantineShell.Section mb="lg">
        <SearchButton collapsed={collapsed} />
      </MantineShell.Section>

      <MantineShell.Section grow component={ScrollArea} type="never">
        <NavGroups
          groups={groups}
          pathname={pathname}
          collapsed={collapsed}
          adminOpen={adminOpen}
          onToggleAdmin={onToggleAdmin}
        />
      </MantineShell.Section>

      <MantineShell.Section pt="sm">
        {impersonating && (
          <ImpersonationCard
            collapsed={collapsed}
            email={user?.email ?? ""}
            leaving={leaving}
            onLeave={leave}
          />
        )}

        {/* No invite card here: an invitation arrives as a notification with
            Accept and Decline on it, so the rail was a second copy of the same
            thing with fewer controls.

            The plan is dropped rather than abbreviated when the rail is
            narrow — it is prose, and still one click away in the account
            menu. */}
        {/* Orbit sits with the cards rather than in the navigation list — see
            `OrbitCard`. First of them, so the assistant stays above the
            warnings that come and go beneath it. */}
        <OrbitCard collapsed={collapsed} />

        {!isDemo && !collapsed && <PlanCard />}

        {/* No workspace switch down here: the header at the top of the rail
            names the active workspace and opens the same menu, so a second
            way in at the other end of the column is just a duplicate. */}
        {isDemo && <DemoCard collapsed={collapsed} onExit={logout} />}

        <AccountMenu
          collapsed={collapsed}
          mobile={mobile}
          name={user?.name ?? ""}
          email={user?.email ?? ""}
          avatarUrl={user?.avatarUrl}
          initials={initials}
          isAdmin={isAdmin}
          dark={dark}
          onToggleScheme={() => setColorScheme(dark ? "light" : "dark")}
          demo={demo}
          demoAvailable={demoAvailable}
          onToggleDemo={toggleDemo}
          onLogout={() => setLogoutOpen(true)}
        />
      </MantineShell.Section>

      <LogoutDialog
        opened={logoutOpen}
        onStay={() => setLogoutOpen(false)}
        onLogout={() => {
          setLogoutOpen(false);
          logout();
          notify.info(t("nav.loggedOut"));
        }}
      />
    </MantineShell.Navbar>
  );
}
