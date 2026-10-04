import { Group, Text, UnstyledButton } from "@mantine/core";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavAction } from "./NavLink";
import { openPalette } from "./openPalette";

export function SearchButton({ collapsed }: { collapsed: boolean }) {
  const { t } = useTranslation();

  // Collapsed, the shortcut moves into the tooltip — the palette it opens is
  // the popup, so the button itself has nothing left to show but its icon.
  if (collapsed) {
    return (
      <NavAction
        collapsed
        icon={Search}
        label={t("nav.search")}
        tooltip={`${t("nav.search")} · Ctrl K`}
        onClick={openPalette}
      />
    );
  }

  return (
    <UnstyledButton
      className="rail-search"
      style={{ display: "block", width: "100%" }}
      onClick={openPalette}
    >
      <Group gap="xs" wrap="nowrap">
        <Search size={15} style={{ color: "var(--muted)", flexShrink: 0 }} />
        <Text size="sm" c="dimmed">{t("nav.search")}</Text>
        <kbd className="kbd" style={{ marginLeft: "auto" }}>Ctrl K</kbd>
      </Group>
    </UnstyledButton>
  );
}
