import { AppShell as MantineShell, ScrollArea } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useAuth, useIsPlatformAdmin } from "@/features/auth/context";
import { useDemo } from "@/features/demo/context";
import { notify, confirmLogout, errMessage } from "@/shared/lib/notify";
import { useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { useState } from "react";
import { RailBrand } from "./RailBrand";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { SearchButton } from "./SearchButton";
import { NavGroups } from "./NavGroups";
import { AccountMenu } from "./AccountMenu";
import { DemoCard, ImpersonationCard, PendingInviteCard, PlanCard } from "./RailCards";
import { ADMIN_GROUP, NAV_GROUPS } from "./navItems";

/**
 * The navigation rail.
 *
 * The same surface as the content panel, so the two read as one app divided by
 * a hairline rather than as two different greys. Flat all the same — no radius,
 * border or shadow of its own; the panel beside it is what carries the frame.
 */
export function Rail({
  pathname,
  collapsed,
  mobile,
  onToggleRail,
  adminOpen,
  onToggleAdmin,
}: {
  pathname: string;
  collapsed: boolean;
  mobile: boolean;
  onToggleRail: () => void;
  adminOpen: boolean;
  onToggleAdmin: () => void;
}) {
  const { t } = useTranslation();
  const { user, logout, exitImpersonation, isDemo } = useAuth();
  const { setColorScheme } = useMantineColorScheme();
  const scheme = useComputedColorScheme("light");
  const dark = scheme === "dark";

  const { demo, available: demoAvailable, toggle: toggleDemo } = useDemo();

  const impersonating = Boolean(user?.impersonating);
  // Super-admin only, and never while impersonating — see `useIsPlatformAdmin`.
  const isAdmin = useIsPlatformAdmin();
  const [leaving, setLeaving] = useState(false);

  const initials = (user?.firstName || user?.name || "?").slice(0, 2).toUpperCase();
  const groups = isAdmin ? [...NAV_GROUPS, ADMIN_GROUP] : NAV_GROUPS;

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
    <MantineShell.Navbar p="sm" style={{ background: "var(--rail)", border: "none" }}>
      {/* On mobile the wordmark already sits in the top bar, so the one here
          would double up inside the open drawer — desktop-only. */}
      <MantineShell.Section visibleFrom="sm">
        <RailBrand collapsed={collapsed} onToggle={onToggleRail} />
      </MantineShell.Section>

      <MantineShell.Section mb="md">
        <WorkspaceSwitcher collapsed={collapsed} />
      </MantineShell.Section>

      <MantineShell.Section mb="md">
        <SearchButton collapsed={collapsed} />
      </MantineShell.Section>

      {/* `type="never"` hides the scrollbar without disabling the scrolling —
          the rail still scrolls by wheel and trackpad, it just stops drawing a
          track down the middle of the navigation. */}
      <MantineShell.Section grow component={ScrollArea} type="never">
        <NavGroups
          groups={groups}
          pathname={pathname}
          collapsed={collapsed}
          adminOpen={adminOpen}
          onToggleAdmin={onToggleAdmin}
        />
      </MantineShell.Section>

      <MantineShell.Section>
        {impersonating && (
          <ImpersonationCard
            collapsed={collapsed}
            email={user?.email ?? ""}
            leaving={leaving}
            onLeave={leave}
          />
        )}

        {/* Dropped rather than abbreviated when the rail is narrow: both are
            prose, and the plan is still one click away in the account menu. */}
        {!isDemo && !collapsed && <PendingInviteCard />}
        {!isDemo && !collapsed && <PlanCard />}

        {isDemo && <DemoCard collapsed={collapsed} onExit={logout} />}

        <AccountMenu
          collapsed={collapsed}
          mobile={mobile}
          name={user?.name ?? ""}
          email={user?.email ?? ""}
          avatarUrl={user?.avatarUrl}
          initials={initials}
          dark={dark}
          onToggleScheme={() => setColorScheme(dark ? "light" : "dark")}
          demo={demo}
          demoAvailable={demoAvailable}
          onToggleDemo={toggleDemo}
          onLogout={() =>
            confirmLogout(() => {
              logout();
              notify.info(t("nav.loggedOut"));
            })
          }
        />
      </MantineShell.Section>
    </MantineShell.Navbar>
  );
}
