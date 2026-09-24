import { BellRing, Link2, Palette, ShieldCheck, UserRound } from "lucide-react";

export type SettingsSectionId = "profile" | "appearance" | "connections" | "notifications" | "security";

export interface SettingsSection {
  id: SettingsSectionId;
  labelKey: string;
  label: string;
  descriptionKey: string;
  description: string;
  icon: typeof UserRound;
}

export const SETTINGS_SECTIONS: SettingsSection[] = [
  {
    id: "profile",
    labelKey: "settings.tabInfo",
    label: "Profile",
    descriptionKey: "settings.profilePageDesc",
    description: "Your name, photo, contact details and how dates are shown.",
    icon: UserRound,
  },
  {
    id: "appearance",
    labelKey: "settings.tabAppearance",
    label: "Appearance",
    descriptionKey: "settings.appearancePageDesc",
    description: "Theme, colours and layout of your dashboard.",
    icon: Palette,
  },
  {
    id: "connections",
    labelKey: "settings.tabConnections",
    label: "Connections",
    descriptionKey: "settings.connectionsPageDesc",
    description: "Accounts linked to Quantalog, like LinkedIn and Instagram.",
    icon: Link2,
  },
  {
    id: "notifications",
    labelKey: "settings.tabNotifications",
    label: "Notifications",
    descriptionKey: "settings.notificationsPageDesc",
    description: "Choose what we notify you about and where.",
    icon: BellRing,
  },
  {
    id: "security",
    labelKey: "settings.tabSecurity",
    label: "Security",
    descriptionKey: "settings.securityPageDesc",
    description: "Password, two-factor authentication and screen lock.",
    icon: ShieldCheck,
  },
];

export const settingsPath = (id: SettingsSectionId) => `/app/settings/${id}`;

const ALIASES: Record<string, string> = {
  info: settingsPath("profile"),
  billing: "/app/billing",
  members: "/app/members",
};

export function findSettingsSection(id: string | undefined): SettingsSection | undefined {
  return SETTINGS_SECTIONS.find((s) => s.id === id);
}

export function settingsRedirectTarget(requested: string | null | undefined): string {
  if (requested && findSettingsSection(requested)) return settingsPath(requested as SettingsSectionId);
  if (requested && ALIASES[requested]) return ALIASES[requested];
  return settingsPath("profile");
}
