import { Menu, ActionIcon, Tooltip, Text, Group } from "@mantine/core";
import { Languages, Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LANGUAGES, useLang } from "@/lib/i18n/locale";

 
export function LanguagePicker() {
  const { t } = useTranslation();

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
        <LanguageItems />
      </Menu.Dropdown>
    </Menu>
  );
}

 
export function LanguageItems() {
  const { t } = useTranslation();
  const { pref, setLang } = useLang();

  return (
    <>
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
    </>
  );
}
