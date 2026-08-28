import { Tabs } from "@mantine/core";
import { UserRound, Palette, Link2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import AvatarCropper from "@/shared/ui/AvatarCropper";
import { AppearanceSection } from "@/features/auth/components/AppearanceSection";
import { useInstagramReturn } from "@/features/social/useInstagramReturn";
import { useProfileForm } from "@/features/auth/components/settings/useProfileForm";
import { InfoPanel } from "@/features/auth/components/settings/InfoPanel";
import { ConnectionsPanel } from "@/features/auth/components/settings/ConnectionsPanel";
import { SaveBar } from "@/features/auth/components/settings/SaveBar";

export default function Settings() {
  const { t } = useTranslation();
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

        <Tabs defaultValue="info" keepMounted={false}>
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
