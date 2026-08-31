import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Badge, Box, Group, Menu, Text, UnstyledButton,
} from "@mantine/core";
import {
  BookOpen, ChevronsUpDown, FlaskConical, Languages, Lightbulb, LogOut, Moon,
  Settings as SettingsIcon, Sun,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { LanguageItems } from "@/lib/i18n/LanguagePicker";
import { ACCOUNT_ITEMS } from "./navItems";
import { RequestFeatureModal } from "./RequestFeatureModal";

/**
 * Who is signed in, and everything that belongs to them rather than to a
 * workspace — settings, appearance, language, the way out.
 */
export function AccountMenu({
  collapsed,
  mobile,
  name,
  email,
  avatarUrl,
  initials,
  dark,
  onToggleScheme,
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
  dark: boolean;
  onToggleScheme: () => void;
  demo: boolean;
  /** Admin-only — the demo row is absent entirely for everyone else. */
  demoAvailable: boolean;
  onToggleDemo: (next: boolean) => void;
  onLogout: () => void;
}) {
  const { t } = useTranslation();
  const [featureOpen, setFeatureOpen] = useState(false);

  return (
    <>
    <RequestFeatureModal opened={featureOpen} onClose={() => setFeatureOpen(false)} />
    <Menu
      position={mobile ? "top" : "right-end"}
      withArrow
      radius="md"
      width={mobile ? "target" : 250}
      withinPortal
      zIndex={400}
    >
      <Menu.Target>
        {/* Collapsed, the avatar alone — it is already a picture of the
            account, so it loses the least of anything in the rail by having
            its text taken away. The menu it opens is unchanged. */}
        <UnstyledButton
          className={collapsed ? "nav-link" : "tile"}
          data-collapsed={collapsed || undefined}
          aria-label={collapsed ? (name || "Account") : undefined}
          style={
            collapsed
              ? {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  padding: 6,
                }
              : { display: "block", width: "100%", padding: 8 }
          }
        >
          {collapsed ? (
            <UserAvatar src={avatarUrl} color="emerald" radius="md" size="sm">
              {initials}
            </UserAvatar>
          ) : (
            <Group gap="sm" wrap="nowrap">
              <UserAvatar src={avatarUrl} color="emerald" radius="md" size="md">
                {initials}
              </UserAvatar>
              <Box style={{ flex: 1, overflow: "hidden" }}>
                <Text size="sm" fw={600} truncate>{name}</Text>
                <Text size="xs" c="dimmed" truncate>{email}</Text>
              </Box>
              <ChevronsUpDown size={14} style={{ flexShrink: 0, color: "var(--muted)" }} />
            </Group>
          )}
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown className="account-menu">
        <Box className="account-menu__header">
          {/* The face as well as the address: this menu is opened to check
              which account is active, and on a shared machine the avatar
              answers that faster than an email string does. */}
          <Group gap="sm" wrap="nowrap">
            <UserAvatar src={avatarUrl} color="emerald" radius="md" size="md">
              {initials}
            </UserAvatar>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text size="sm" fw={600} truncate title={name}>{name}</Text>
              <Text size="xs" c="dimmed" truncate title={email}>{email}</Text>
            </Box>
          </Group>

          {/* Workspace, plan and the billing button used to sit here. They are
              gone deliberately: the sidebar already carries a persistent plan
              card, so this menu was saying the same thing twice, and the header
              reads as an account identity block rather than a billing panel. */}
        </Box>

        {/* No divider here: the header carries its own bottom border now, and
            the two together read as a double rule. */}
        <Menu.Item component={Link} to="/app/settings" leftSection={<SettingsIcon size={15} />}>
          {t("nav.settings")}
        </Menu.Item>
        {ACCOUNT_ITEMS.map((item) => (
          <Menu.Item
            key={item.to}
            component={Link}
            to={item.to}
            leftSection={<item.icon size={15} />}
          >
            {t(item.labelKey, item.label)}
          </Menu.Item>
        ))}

        <Menu.Divider />

        {/* Named rather than a glyph, and stating what it will switch *to* —
            a moon captioned only by its own icon leaves you guessing whether it
            shows the current mode or the one it moves to. */}
        <Menu.Item
          leftSection={dark ? <Sun size={15} /> : <Moon size={15} />}
          onClick={onToggleScheme}
          closeMenuOnClick={false}
        >
          {dark ? t("nav.lightMode") : t("nav.darkMode")}
        </Menu.Item>

        {/* A submenu, because the language list is long enough that inlining it
            would bury everything below it. */}
        <Menu.Sub>
          <Menu.Sub.Target>
            <Menu.Sub.Item leftSection={<Languages size={15} />}>
              {t("nav.language")}
            </Menu.Sub.Item>
          </Menu.Sub.Target>
          <Menu.Sub.Dropdown>
            <LanguageItems />
          </Menu.Sub.Dropdown>
        </Menu.Sub>

        {/* Admin-only: renders nothing when demo data is not available. */}
        {demoAvailable && (
          <Menu.Item
            leftSection={<FlaskConical size={15} />}
            rightSection={
              demo ? <Badge size="xs" variant="light" color="violet" tt="none">on</Badge> : null
            }
            onClick={() => onToggleDemo(!demo)}
            closeMenuOnClick={false}
          >
            {t("nav.demoData", "Demo data")}
          </Menu.Item>
        )}

        <Menu.Item
          component="a"
          href="https://quantalog.daorbit.in/docs"
          target="_blank"
          rel="noreferrer"
          leftSection={<BookOpen size={15} />}
        >
          {t("nav.documentation")}
        </Menu.Item>

        {/* Opens the hosted feature-request form in a modal rather than a new
            tab, so the user stays in the app. */}
        <Menu.Item
          leftSection={<Lightbulb size={15} />}
          onClick={() => setFeatureOpen(true)}
          closeMenuOnClick={false}
        >
          {t("nav.requestFeature", "Request a feature")}
        </Menu.Item>

        <Menu.Divider />

        {/* Mantine fills a coloured menu item solid on hover, which for a
            destructive-red item reads as an alert rather than a hover state.
            `danger-item` tints it instead — see polish.css. */}
        <Menu.Item
          color="red"
          className="danger-item"
          leftSection={<LogOut size={15} />}
          onClick={onLogout}
        >
          {t("nav.logout")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
    </>
  );
}
