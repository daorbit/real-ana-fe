import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Menu, UnstyledButton } from "@mantine/core";
import {
  BookOpen, ChevronsUpDown, FlaskConical, Languages, Lightbulb, LifeBuoy, LogOut, PanelLeft, Scale, Settings, ShieldCheck, StickyNote,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNotes } from "@/features/notes";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { LanguageItems } from "@/lib/i18n/LanguagePicker";
import { CONTACT_URL, DOCS_BASE_URL, LEGAL_URLS } from "@/shared/lib/docsSlugs";
import { settingsPath } from "@/features/auth/components/settings/settingsSections";
import type { ThemeMode } from "@/shared/lib/theme";
import { ADMIN_ITEMS } from "./navItems";
import { ThemeSwitch } from "./ThemeSwitch";
import { RequestFeatureModal } from "./RequestFeatureModal";
import classes from "./Rail.module.css";
import { MenuVersion } from "./MenuVersion";

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
  demo,
  demoAvailable,
  onToggleDemo,
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
  demo: boolean;
  demoAvailable: boolean;
  onToggleDemo: (next: boolean) => void;
  onLogout: () => void;
}) {
  const { t } = useTranslation();
  const [featureOpen, setFeatureOpen] = useState(false);
  const notes = useNotes();
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

          <div className={classes.menuSection}>{t("settings.appearance", "Appearance")}</div>
          <div className={classes.themeWrap}>
            <ThemeSwitch mode={mode} onChange={onMode} />
          </div>

          <Menu.Item component={Link} to={settingsPath("profile")} leftSection={<Settings size={15} />}>
            {t("nav.accountSettings", "Account settings")}
          </Menu.Item>

          <Menu.Item component={Link} to={settingsPath("sidebar")} leftSection={<PanelLeft size={15} />}>
            {t("nav.customizeSidebar", "Customize sidebar")}
          </Menu.Item>

          <Menu.Item leftSection={<StickyNote size={15} />} onClick={() => notes.open()}>
            {t("nav.notes", "Notes")}
          </Menu.Item>

          <Menu.Sub>
            <Menu.Sub.Target>
              <Menu.Sub.Item leftSection={<Languages size={15} />}>{t("nav.language", "Language")}</Menu.Sub.Item>
            </Menu.Sub.Target>
            <Menu.Sub.Dropdown>
              <LanguageItems />
            </Menu.Sub.Dropdown>
          </Menu.Sub>

          {demoAvailable && (
            <Menu.Item
              leftSection={<FlaskConical size={15} />}
              rightSection={demo ? <Badge size="xs" variant="light" color="violet" tt="none">on</Badge> : null}
              onClick={() => onToggleDemo(!demo)}
              closeMenuOnClick={false}
            >
              {t("nav.demoData", "Demo data")}
            </Menu.Item>
          )}

          {isAdmin && (
            <Menu.Sub>
              <Menu.Sub.Target>
                <Menu.Sub.Item leftSection={<ShieldCheck size={15} />}>{t("nav.adminTools", "Admin tools")}</Menu.Sub.Item>
              </Menu.Sub.Target>
              <Menu.Sub.Dropdown>
                {ADMIN_ITEMS.map((item) => (
                  <Menu.Item key={item.to} component={Link} to={item.to} leftSection={<item.icon size={15} />}>
                    {t(item.labelKey, item.label)}
                  </Menu.Item>
                ))}
              </Menu.Sub.Dropdown>
            </Menu.Sub>
          )}

          <Menu.Divider />
          <div className={classes.menuSection}>{t("nav.help", "Help")}</div>

          <Menu.Item component="a" href={DOCS_BASE_URL} target="_blank" rel="noreferrer" leftSection={<BookOpen size={15} />}>
            {t("nav.documentation", "Documentation")}
          </Menu.Item>
          <Menu.Item leftSection={<Lightbulb size={15} />} onClick={() => setFeatureOpen(true)}>
            {t("nav.requestFeature", "Request a feature")}
          </Menu.Item>
          <Menu.Item component="a" href={CONTACT_URL} target="_blank" rel="noreferrer" leftSection={<LifeBuoy size={15} />}>
            {t("nav.contactSupport", "Contact support")}
          </Menu.Item>
          <Menu.Sub>
            <Menu.Sub.Target>
              <Menu.Sub.Item leftSection={<Scale size={15} />}>{t("nav.legal", "Legal")}</Menu.Sub.Item>
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

          <Menu.Item color="red" className="danger-item" leftSection={<LogOut size={15} />} onClick={onLogout}>
            {t("nav.logout", "Log out")}
          </Menu.Item>

          <Menu.Divider />
          <MenuVersion />
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
