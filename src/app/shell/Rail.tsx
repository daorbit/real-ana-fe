import { AppShell as MantineShell, Box, Group, ScrollArea } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAuth, useIsPlatformAdmin } from "@/features/auth/context";
import { useDemo } from "@/features/demo/context";
import { notify } from "@/shared/lib/notify";
import { useState } from "react";
import { useThemeMode } from "./useThemeMode";
import { ThemeToggleButton } from "./ThemeSwitch";
import classes from "./Rail.module.css";
import { RailBrand } from "./RailBrand";
import { SearchButton } from "./SearchButton";
import { NavGroups } from "./NavGroups";
import { RailWorkspaceHeader } from "./RailWorkspaceHeader";
import { AccountMenu } from "./AccountMenu";
import { DemoCard, OrbitCard } from "./RailCards";
import { useNavGroups } from "./useNavGroups";
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
  const { user, logout, isDemo } = useAuth();
  const { mode, setMode } = useThemeMode();

  const { demo, available: demoAvailable, toggle: toggleDemo } = useDemo();

  const [logoutOpen, setLogoutOpen] = useState(false);

  // Super-admin only, and never while impersonating — see `useIsPlatformAdmin`.
  const isAdmin = useIsPlatformAdmin();

  const initials = (user?.firstName || user?.name || "?").slice(0, 2).toUpperCase();
  const groups = useNavGroups();

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
    const cards = isDemo ? <DemoCard collapsed={false} onExit={logout} /> : undefined;

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
