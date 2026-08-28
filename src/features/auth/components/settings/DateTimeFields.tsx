import { Code, Select } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Section, Field } from "@/shared/ui/Page";
import { LOCALES, TIMEZONES, BROWSER_LOCALE, BROWSER_TZ } from "./constants";
import type { ProfileForm } from "./useProfileForm";

export function DateTimeFields({ form }: { form: ProfileForm }) {
  const { t } = useTranslation();
  const { dateLocale, setDateLocale, timezone, setTimezone, preview } = form;

  return (
    <Section title={t("settings.datesTitle")} description={t("settings.datesDesc")}>
      <Field
        label={t("settings.dateFormat")}
        hint={
          !dateLocale && BROWSER_LOCALE
            ? t("settings.dateFormatHintDetected", { value: BROWSER_LOCALE })
            : t("settings.dateFormatHint")
        }
      >
        <Select
          data={LOCALES}
          value={dateLocale}
          onChange={(v) => setDateLocale(v ?? "")}
          allowDeselect={false}
          comboboxProps={{ withinPortal: true, radius: "md" }}
        />
      </Field>
      <Field
        label={t("settings.timezone")}
        hint={
          !timezone && BROWSER_TZ
            ? t("settings.timezoneHintDetected", { value: BROWSER_TZ })
            : t("settings.timezoneHint")
        }
      >
        <Select
          data={TIMEZONES}
          value={timezone}
          onChange={(v) => setTimezone(v ?? "")}
          allowDeselect={false}
          searchable
          comboboxProps={{ withinPortal: true, radius: "md" }}
        />
      </Field>
      <Field label={t("settings.preview")} hint={t("settings.previewHint")} last>
        <Code
          block
          style={{
            fontSize: 13,
            padding: "10px 12px",
            background: "var(--surface-2)",
          }}
        >
          {preview}
        </Code>
      </Field>
    </Section>
  );
}
