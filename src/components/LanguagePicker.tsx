import { Menu, ActionIcon, Tooltip, Text, Group } from "@mantine/core";
import { Languages, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LANGUAGES, useLang } from "../locale";

/**
 * The interface-language switch, as a compact menu button for the sidebar.
 *
 * Language is a client-only preference (localStorage, never the server), so
 * this is the only place it's set — the Settings page no longer carries it.
 * Picking a language switches the whole app live and flips document direction
 * for RTL scripts; the choice is remembered on this device.
 *
 * "Match my browser" is offered as the first option so a shared machine can be
 * left to follow whoever's browser it is rather than pinning one person's pick.
 */
export function LanguagePicker() {
  const { t } = useTranslation();
  const { pref, setLang } = useLang();

  return (
    <Menu position="right-end" withArrow radius="md" width={220}>
      <Menu.Target>
        <Tooltip label={t("nav.language")} withArrow>
          <ActionIcon variant="subtle" color="gray" aria-label={t("nav.language")}>
            <Languages size={16} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>{t("language.label")}</Menu.Label>
        {LANGUAGES.map((l) => {
          const selected = pref === l.value;
          return (
            <Menu.Item
              key={l.value || "auto"}
              onClick={() => setLang(l.value)}
              rightSection={
                selected ? <Check size={14} style={{ color: "var(--violet-2)" }} /> : null
              }
            >
              <Group gap={8} wrap="nowrap">
                <Text size="sm" fw={selected ? 600 : 400}>
                  {l.value ? l.native : t("common.matchBrowser")}
                </Text>
                {l.value && l.value !== l.native && (
                  <Text size="xs" c="dimmed" truncate>
                    {l.label.replace(`${l.native} `, "")}
                  </Text>
                )}
              </Group>
            </Menu.Item>
          );
        })}
      </Menu.Dropdown>
    </Menu>
  );
}
