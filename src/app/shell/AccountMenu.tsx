import { useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Menu, UnstyledButton } from "@mantine/core";
import {
  BookOpen, ChevronsUpDown, FlaskConical, Languages, Lightbulb, LifeBuoy, LogOut, Settings, ShieldCheck,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { LanguageItems } from "@/lib/i18n/LanguagePicker";
import { DOCS_BASE_URL } from "@/shared/lib/docsSlugs";
import { settingsPath } from "@/features/auth/components/settings/settingsSections";
import type { ThemeMode } from "@/shared/lib/theme";
import { ADMIN_ITEMS } from "./navItems";
import { ThemeSwitch } from "./ThemeSwitch";
import { RequestFeatureModal } from "./RequestFeatureModal";
import { SupportRequestModal } from "./SupportRequestModal";
import classes from "./Rail.module.css";

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
  const [supportOpen, setSupportOpen] = useState(false);
  const [opened, setOpened] = useState(false);

  const trigger = (
    <UnstyledButton
      className={classes.account}
      data-collapsed={collapsed || undefined}
      data-expanded={opened || undefined}
      aria-label={collapsed ? name || "Account" : undefined}
    >
      <UserAvatar src={avatarUrl} color="emerald" radius="md" size={collapsed ? "sm" : 34}>
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
      <SupportRequestModal opened={supportOpen} onClose={() => setSupportOpen(false)} />
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
          <Menu.Item leftSection={<LifeBuoy size={15} />} onClick={() => setSupportOpen(true)}>
            {t("nav.contactSupport", "Contact support")}
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item color="red" className="danger-item" leftSection={<LogOut size={15} />} onClick={onLogout}>
            {t("nav.logout", "Log out")}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
