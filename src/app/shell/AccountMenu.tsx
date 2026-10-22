import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, UnstyledButton } from "@mantine/core";
import {
  ChevronsUpDown,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotes } from "@/features/notes";
import { useWorkspaceApps } from "@/features/workspace/useWorkspaceApps";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { LanguageItems } from "@/lib/i18n/LanguagePicker";
import { CONTACT_URL, LEGAL_URLS } from "@/shared/lib/docsSlugs";
import type { ThemeMode } from "@/shared/lib/theme";
import { ADMIN_TOOLS_PATH } from "@/features/admin/lib/adminSections";
import { ThemeSwitch } from "./ThemeSwitch";
import { RequestFeatureModal } from "./RequestFeatureModal";
import { DemoCallBanner } from "./DemoCallBanner";
import { DemoCallModal } from "./DemoCallModal";
import classes from "./Rail.module.css";
import { MenuVersion } from "./MenuVersion";
import { MenuArtIcon } from "./MenuArtIcon";

export function AccountMenu({
  collapsed,
  mobile,
  name,
  email,
  avatarUrl,
  initials,
  isAdmin,
  mode,
  onMode,
  onLogout,
}: {
  collapsed: boolean;
  mobile: boolean;
  name: string;
  email: string;
  avatarUrl?: string;
  initials: string;
  isAdmin: boolean;
  mode: ThemeMode;
  onMode: (mode: ThemeMode) => void;
  onLogout: () => void;
}) {
  const { t } = useTranslation();
  const [featureOpen, setFeatureOpen] = useState(false);
  const [demoCallOpen, setDemoCallOpen] = useState(false);
  const notes = useNotes();
  const { notes: notesOn } = useWorkspaceApps();
  const [opened, setOpened] = useState(false);

  const trigger = (
    <UnstyledButton
      className={classes.account}
      data-collapsed={collapsed || undefined}
      data-expanded={opened || undefined}
      aria-label={collapsed ? name || "Account" : undefined}
    >
      <UserAvatar src={avatarUrl} color="emerald" radius="md" size={collapsed ? 30 : 34}>
        {initials}
      </UserAvatar>
      {!collapsed && (
        <>
          <span className={classes.accountText}>
            <span className={classes.accountName}>{name}</span>
            <span className={classes.accountEmail}>{email}</span>
          </span>
          <ChevronsUpDown size={14} className={classes.accountChevron} />
        </>
      )}
    </UnstyledButton>
  );

  return (
    <>
      <RequestFeatureModal opened={featureOpen} onClose={() => setFeatureOpen(false)} />
      <DemoCallModal opened={demoCallOpen} onClose={() => setDemoCallOpen(false)} />
      <Menu
        opened={opened}
        onChange={setOpened}
        position={mobile ? "top" : "right-end"}
        offset={10}
        radius="lg"
        width={272}
        withinPortal
        zIndex={400}
      >
        <Menu.Target>{trigger}</Menu.Target>

        <Menu.Dropdown className={`account-menu ${classes.menu}`}>
          <div className={classes.menuHeader}>
            <UserAvatar src={avatarUrl} color="emerald" radius="md" size={38}>
              {initials}
            </UserAvatar>
            <span className={classes.accountText}>
              <span className={classes.accountName} title={name}>{name}</span>
              <span className={classes.accountEmail} title={email}>{email}</span>
            </span>
          </div>

          <DemoCallBanner
            onOpen={() => {
              setOpened(false);
              setDemoCallOpen(true);
            }}
          />

          <div className={classes.menuSection}>{t("settings.appearance", "Appearance")}</div>
          <div className={classes.themeWrap}>
            <ThemeSwitch mode={mode} onChange={onMode} />
          </div>

          {notesOn && (
            <Menu.Item leftSection={<MenuArtIcon src="/apps/quantalog-notes.svg" />} onClick={() => notes.open()}>
              {t("nav.notes", "Notes")}
            </Menu.Item>
          )}

          <Menu.Sub>
            <Menu.Sub.Target>
              <Menu.Sub.Item leftSection={<MenuArtIcon src="/nav/language.svg" />}>{t("nav.language", "Language")}</Menu.Sub.Item>
            </Menu.Sub.Target>
            <Menu.Sub.Dropdown>
              <LanguageItems />
            </Menu.Sub.Dropdown>
          </Menu.Sub>

          {isAdmin && (
            <Menu.Item component={Link} to={ADMIN_TOOLS_PATH} leftSection={<MenuArtIcon src="/nav/admin-tools.svg" />}>
              {t("nav.adminTools", "Admin tools")}
            </Menu.Item>
          )}

          <Menu.Divider />
          <div className={classes.menuSection}>{t("nav.help", "Help")}</div>

          <Menu.Item leftSection={<MenuArtIcon src="/nav/request-feature.svg" />} onClick={() => setFeatureOpen(true)}>
            {t("nav.requestFeature", "Request a feature")}
          </Menu.Item>
          <Menu.Item component="a" href={CONTACT_URL} target="_blank" rel="noreferrer" leftSection={<MenuArtIcon src="/nav/contact-support.svg" />}>
            {t("nav.contactSupport", "Contact support")}
          </Menu.Item>
          <Menu.Sub>
            <Menu.Sub.Target>
              <Menu.Sub.Item leftSection={<MenuArtIcon src="/nav/legal.svg" />}>{t("nav.legal", "Legal")}</Menu.Sub.Item>
            </Menu.Sub.Target>
            <Menu.Sub.Dropdown>
              <Menu.Item component="a" href={LEGAL_URLS.terms} target="_blank" rel="noreferrer">
                {t("legal.terms", "Terms of Service")}
              </Menu.Item>
              <Menu.Item component="a" href={LEGAL_URLS.privacy} target="_blank" rel="noreferrer">
                {t("legal.privacy", "Privacy Policy")}
              </Menu.Item>
              <Menu.Item component="a" href={LEGAL_URLS.dpa} target="_blank" rel="noreferrer">
                {t("legal.dpa", "Data Processing Addendum")}
              </Menu.Item>
            </Menu.Sub.Dropdown>
          </Menu.Sub>

          <Menu.Divider />

          <Menu.Item color="red" className="danger-item" leftSection={<MenuArtIcon src="/nav/logout.svg" />} onClick={onLogout}>
            {t("nav.logout", "Log out")}
          </Menu.Item>

          <Menu.Divider />
          <MenuVersion />
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
