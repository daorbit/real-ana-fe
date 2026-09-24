import { Navigate, useLocation, useParams } from "react-router-dom";
import { Divider } from "@mantine/core";
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
import {
  findSettingsSection,
  settingsRedirectTarget,
  type SettingsSectionId,
} from "@/features/auth/components/settings/settingsSections";
import { useTitle } from "@/shared/lib/useTitle";
import type { ProfileForm } from "@/features/auth/components/settings/useProfileForm";

function SectionBody({ id, form }: { id: SettingsSectionId; form: ProfileForm }) {
  switch (id) {
    case "profile":
      return <InfoPanel form={form} />;
    case "appearance":
      return <AppearanceSection bare />;
    case "connections":
      return <ConnectionsPanel />;
    case "notifications":
      return <NotificationsPanel />;
    case "security":
      return (
        <>
          <PasswordPanel />
          <Divider my="xl" />
          <TwoFactorPanel />
          <Divider my="xl" />
          <ScreenLockPanel />
        </>
      );
  }
}

function LegacySettingsRedirect() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const requested = params.get("instagram") ? "connections" : params.get("tab");
  params.delete("tab");
  const query = params.toString();
  return <Navigate to={`${settingsRedirectTarget(requested)}${query ? `?${query}` : ""}`} replace />;
}

export default function Settings() {
  const { section: sectionId } = useParams<{ section?: string }>();
  const section = findSettingsSection(sectionId);

  if (!sectionId) return <LegacySettingsRedirect />;
  if (!section) return <Navigate to={settingsRedirectTarget(sectionId)} replace />;
  return <SettingsSectionPage id={section.id} />;
}

function SettingsSectionPage({ id }: { id: SettingsSectionId }) {
  const { t } = useTranslation();
  const section = findSettingsSection(id)!;
  useTitle(`${section.label} · Settings`);
  useInstagramReturn();
  const form = useProfileForm();
  const { user, cropFile, setCropFile, avatarBusy, saving, dirty, seedFromUser, submit, saveCrop } = form;

  if (!user) return null;

  return (
    <AppShell>
      <form onSubmit={submit}>
        <PageHeader
          title={t(section.labelKey, section.label)}
          description={t(section.descriptionKey, section.description)}
        />

        <SectionBody id={id} form={form} />

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
