import { AppShell as MantineShell, Box, Group, ScrollArea } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAuth, useIsPlatformAdmin } from "@/features/auth/context";
import { useDemo } from "@/features/demo/context";
import { notify, errMessage } from "@/shared/lib/notify";
import { useMemo, useState } from "react";
import { useThemeMode } from "./useThemeMode";
import { ThemeToggleButton } from "./ThemeSwitch";
import classes from "./Rail.module.css";
import { RailBrand } from "./RailBrand";
import { SearchButton } from "./SearchButton";
import { NavGroups } from "./NavGroups";
import { RailWorkspaceHeader } from "./RailWorkspaceHeader";
import { AccountMenu } from "./AccountMenu";
import { DemoCard, ImpersonationCard, OrbitCard, PlanCard } from "./RailCards";
import { NAV_GROUPS } from "./navItems";
import { useNavPrefs } from "./navPrefs";
import { applyNavPrefs } from "./applyNavPrefs";
import { LogoutDialog } from "./LogoutDialog";
import { MobileMoreSheet } from "./mobile/MobileMoreSheet";

 
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
  const { mode, setMode } = useThemeMode();

  const { demo, available: demoAvailable, toggle: toggleDemo } = useDemo();

  const [logoutOpen, setLogoutOpen] = useState(false);

  const impersonating = Boolean(user?.impersonating);
  // Super-admin only, and never while impersonating — see `useIsPlatformAdmin`.
  const isAdmin = useIsPlatformAdmin();
  const [leaving, setLeaving] = useState(false);

  const initials = (user?.firstName || user?.name || "?").slice(0, 2).toUpperCase();
  const navPrefs = useNavPrefs();
  const groups = useMemo(() => applyNavPrefs(NAV_GROUPS, navPrefs), [navPrefs]);

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

  const accountMenu = (
    <AccountMenu
      collapsed={false}
      mobile={mobile}
      name={user?.name ?? ""}
      email={user?.email ?? ""}
      avatarUrl={user?.avatarUrl}
      initials={initials}
      isAdmin={isAdmin}
      mode={mode}
      onMode={setMode}
      demo={demo}
      demoAvailable={demoAvailable}
      onToggleDemo={toggleDemo}
      onLogout={() => setLogoutOpen(true)}
    />
  );

  const logoutDialog = (
    <LogoutDialog
      opened={logoutOpen}
      onStay={() => setLogoutOpen(false)}
      onLogout={() => {
        setLogoutOpen(false);
        logout();
        notify.info(t("nav.loggedOut"));
      }}
    />
  );

  if (mobile) {
    const cards = (
      <>
        {impersonating && (
          <ImpersonationCard collapsed={false} email={user?.email ?? ""} leaving={leaving} onLeave={leave} />
        )}
        {isDemo ? <DemoCard collapsed={false} onExit={logout} /> : <PlanCard />}
      </>
    );

    return (
      <MantineShell.Navbar p={0}>
        <MobileMoreSheet
          pathname={pathname}
          onClose={onCloseNav}
          cards={cards}
          account={
            <>
              {accountMenu}
              <ThemeToggleButton onChange={setMode} />
            </>
          }
        />
        {logoutDialog}
      </MantineShell.Navbar>
    );
  }

  return (
    <MantineShell.Navbar p="md">

      <MantineShell.Section visibleFrom="sm" mb="md">
        <Group gap={4} wrap="nowrap" align="center" justify={collapsed ? "center" : undefined}>
          {!collapsed && (
            <Box style={{ minWidth: 0, flex: 1 }}>
              <RailWorkspaceHeader collapsed={collapsed} />
            </Box>
          )}
          <RailBrand collapsed={collapsed} onToggle={onToggleRail} />
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

        {!isDemo && !collapsed && <PlanCard />}

        {isDemo && <DemoCard collapsed={collapsed} onExit={logout} />}

        <div className={classes.foot} data-collapsed={collapsed || undefined}>
          <OrbitCard collapsed={collapsed} />
          <div className={classes.accountRow}>
            <AccountMenu
              collapsed={collapsed}
              mobile={mobile}
              name={user?.name ?? ""}
              email={user?.email ?? ""}
              avatarUrl={user?.avatarUrl}
              initials={initials}
              isAdmin={isAdmin}
              mode={mode}
              onMode={setMode}
              demo={demo}
              demoAvailable={demoAvailable}
              onToggleDemo={toggleDemo}
              onLogout={() => setLogoutOpen(true)}
            />
            {!collapsed && <ThemeToggleButton onChange={setMode} />}
          </div>
        </div>
      </MantineShell.Section>

      {logoutDialog}
    </MantineShell.Navbar>
  );
}
