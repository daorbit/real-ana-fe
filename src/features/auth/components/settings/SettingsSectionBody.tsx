import { Box } from "@mantine/core";
import { AppearanceSection } from "@/features/auth/components/AppearanceSection";
import { InfoPanel } from "./InfoPanel";
import { ConnectionsPanel } from "./ConnectionsPanel";
import { SidebarPanel } from "./sidebar/SidebarPanel";
import { NotificationsPanel } from "./NotificationsPanel";
import { SecurityOverview } from "./SecurityOverview";
import { PasswordPanel } from "./PasswordPanel";
import { TwoFactorPanel } from "./TwoFactorPanel";
import { ScreenLockPanel } from "./ScreenLockPanel";
import { SessionsPanel } from "./SessionsPanel";
import { AccountActivityPanel } from "./AccountActivityPanel";
import { DeleteAccountPanel } from "./DeleteAccountPanel";
import securityClasses from "./Security.module.css";
import type { SettingsSectionId } from "./settingsSections";
import type { ProfileForm } from "./useProfileForm";

export function SettingsSectionBody({ id, form }: { id: SettingsSectionId; form: ProfileForm }) {
  switch (id) {
    case "profile":
      return <InfoPanel form={form} />;
    case "appearance":
      return <AppearanceSection bare />;
    case "sidebar":
      return <SidebarPanel />;
    case "connections":
      return <ConnectionsPanel />;
    case "notifications":
      return <NotificationsPanel />;
    case "security":
      return (
        <Box className={securityClasses.stack}>
          <SecurityOverview />
          <PasswordPanel />
          <TwoFactorPanel />
          <ScreenLockPanel />
          <SessionsPanel />
          <AccountActivityPanel />
          <DeleteAccountPanel />
        </Box>
      );
  }
}
