import { Group, Text, UnstyledButton } from "@mantine/core";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavAction } from "./NavLink";

/**
 * Somewhere visible that says the command palette exists.
 *
 * The palette is keyboard-driven, so without this the feature is invisible to
 * anyone who has not been told the shortcut. Clicking dispatches that same
 * shortcut rather than reaching into the palette's own state — one way in,
 * whichever way it was asked for.
 */
function openPalette() {
  window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
}

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
      className="tile"
      style={{ display: "block", width: "100%", padding: "7px 10px" }}
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
