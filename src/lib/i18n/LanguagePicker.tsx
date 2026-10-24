import { Menu, Text, Group } from "@mantine/core";
import { Check } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LANGUAGES, readTranslateLanguage, setTranslateLanguage } from "@/lib/i18n/locale";
import { Flag } from "./Flag";
import classes from "./LanguagePicker.module.css";

export function LanguageItems() {
  const { t } = useTranslation();
  const active = readTranslateLanguage();

  const select = (code: string) => {
    if (code !== active) setTranslateLanguage(code);
  };

  return (
    <>
      <Menu.Label>{t("language.label")}</Menu.Label>
      <div className={classes.list} translate="no">
        {LANGUAGES.map((l) => {
          const selected = active === l.code;
          return (
            <Menu.Item
              key={l.code}
              onClick={() => select(l.code)}
              data-selected={selected || undefined}
              leftSection={<Flag code={l.flag} />}
              rightSection={selected ? <Check size={14} className={classes.check} /> : null}
            >
              <Group gap={8} wrap="nowrap">
                <Text size="sm" fw={selected ? 600 : 400} lang={l.code}>
                  {l.native}
                </Text>
                {l.native !== l.label && (
                  <Text size="xs" c="dimmed" truncate>
                    {l.label}
                  </Text>
                )}
              </Group>
            </Menu.Item>
          );
        })}
      </div>
    </>
  );
}
