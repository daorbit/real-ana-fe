import { Navigate, useLocation, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { AppShell } from "@/app/AppShell";
import { PageHeader } from "@/shared/ui/Page";
import AvatarCropper from "@/shared/ui/AvatarCropper";
import { useInstagramReturn } from "@/features/social/useInstagramReturn";
import { useProfileForm } from "@/features/auth/components/settings/useProfileForm";
import { SaveBar } from "@/features/auth/components/settings/SaveBar";
import { SettingsSectionBody } from "@/features/auth/components/settings/SettingsSectionBody";
import { AppVersion } from "@/features/auth/components/settings/AppVersion";
import { PageTabs } from "@/shared/ui/PageTabs";
import { pageTabId, pageTabPanelId } from "@/shared/ui/pageTabIds";
import pageClasses from "@/features/auth/components/settings/SettingsPage.module.css";
import {
  SETTINGS_SECTIONS,
  findSettingsSection,
  settingsPath,
  settingsRedirectTarget,
  type SettingsSectionId,
} from "@/features/auth/components/settings/settingsSections";
import { useTitle } from "@/shared/lib/useTitle";

const TABS_ID = "settings";

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
  return <SettingsPage id={section.id} />;
}

function SettingsPage({ id }: { id: SettingsSectionId }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const section = findSettingsSection(id)!;
  useTitle(`${section.label} · Settings`);
  useInstagramReturn();
  const form = useProfileForm();
  const { user, cropFile, setCropFile, avatarBusy, saving, dirty, seedFromUser, submit, saveCrop } = form;

  if (!user) return null;

  const select = (next: SettingsSectionId) => {
    if (next !== id) navigate(settingsPath(next), { replace: true });
  };

  return (
    <AppShell>
      <form onSubmit={submit}>
        <PageHeader
          title={t("settings.title", "Settings")}
          description={t(
            "settings.pageDesc",
            "Your profile, how Quantalog looks, the accounts it's linked to, what it tells you about, and how your account is protected.",
          )}
        />

        <PageTabs
          items={SETTINGS_SECTIONS.map((s) => ({ id: s.id, label: t(s.labelKey, s.label) }))}
          active={id}
          onChange={select}
          label={t("settings.title", "Settings")}
          idPrefix={TABS_ID}
        />

        <motion.div
          key={id}
          role="tabpanel"
          id={pageTabPanelId(TABS_ID, id)}
          aria-labelledby={pageTabId(TABS_ID, id)}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
        >
          <p className={pageClasses.intro}>{t(section.descriptionKey, section.description)}</p>
          <SettingsSectionBody id={id} form={form} />
        </motion.div>

        <AppVersion />

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
