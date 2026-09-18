import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, Divider } from "@mantine/core";
import { UserRound, Palette, Link2, ShieldCheck, BellRing } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import AvatarCropper from "@/shared/ui/AvatarCropper";
import { AppearanceSection } from "@/features/auth/components/AppearanceSection";
import { useInstagramReturn } from "@/features/social/useInstagramReturn";
import { useProfileForm } from "@/features/auth/components/settings/useProfileForm";
import { InfoPanel } from "@/features/auth/components/settings/InfoPanel";
import { ConnectionsPanel } from "@/features/auth/components/settings/ConnectionsPanel";
import { TwoFactorPanel } from "@/features/auth/components/settings/TwoFactorPanel";
import { ScreenLockPanel } from "@/features/auth/components/settings/ScreenLockPanel";
import { PasswordPanel } from "@/features/auth/components/settings/PasswordPanel";
import { NotificationsPanel } from "@/features/auth/components/settings/NotificationsPanel";
import { SaveBar } from "@/features/auth/components/settings/SaveBar";
import { useTitle } from "@/shared/lib/useTitle";

/** Tabs that may be linked to from elsewhere, so a bad `?tab=` cannot blank the page. */
const TABS = ["info", "appearance", "connections", "notifications", "security"];

export default function Settings() {
  useTitle("Settings");
  const { t } = useTranslation();

  // The activity panel's settings button links straight to the notifications
  // tab, so the open tab has to be readable from the URL rather than fixed at
  // mount.
  const [params] = useSearchParams();
  const requested = params.get("tab");
  const [tab, setTab] = useState<string | null>(
    requested && TABS.includes(requested) ? requested : "info",
  );
  useInstagramReturn();
  const form = useProfileForm();
  const { user, cropFile, setCropFile, avatarBusy, saving, dirty, seedFromUser, submit, saveCrop } =
    form;

  if (!user) return null;

  return (
    <AppShell>
      <form onSubmit={submit}>
        <PageHeader
          title={t("settings.title")}
          description={t("settings.description")}
        />

        <Tabs value={tab} onChange={setTab} keepMounted={false}>
          <Tabs.List mb="xl">
            <Tabs.Tab value="info" leftSection={<UserRound size={15} />}>
              {t("settings.tabInfo", "Info")}
            </Tabs.Tab>
            <Tabs.Tab value="appearance" leftSection={<Palette size={15} />}>
              {t("settings.tabAppearance", "Appearance")}
            </Tabs.Tab>
            <Tabs.Tab value="connections" leftSection={<Link2 size={15} />}>
              {t("settings.tabConnections", "Connections")}
            </Tabs.Tab>
            <Tabs.Tab value="notifications" leftSection={<BellRing size={15} />}>
              {t("settings.tabNotifications", "Notifications")}
            </Tabs.Tab>
            <Tabs.Tab value="security" leftSection={<ShieldCheck size={15} />}>
              {t("settings.tabSecurity", "Security")}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="info">
            <InfoPanel form={form} />
          </Tabs.Panel>

          <Tabs.Panel value="appearance">
            <AppearanceSection bare />
          </Tabs.Panel>

          <Tabs.Panel value="connections">
            <ConnectionsPanel />
          </Tabs.Panel>

          <Tabs.Panel value="notifications">
            <NotificationsPanel />
          </Tabs.Panel>

          <Tabs.Panel value="security">
            <PasswordPanel />
            <Divider my="xl" />
            <TwoFactorPanel />
            <Divider my="xl" />
            <ScreenLockPanel />
          </Tabs.Panel>
        </Tabs>

        {dirty && <SaveBar saving={saving} onDiscard={seedFromUser} />}
      </form>

      <AvatarCropper
        file={cropFile}
        busy={avatarBusy}
        onCancel={() => setCropFile(null)}
        onConfirm={(cropped) => void saveCrop(cropped)}
      />
    </AppShell>
  );
}
