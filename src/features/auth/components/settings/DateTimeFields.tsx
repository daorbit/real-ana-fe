import { Box, Select } from "@mantine/core";
import { CalendarClock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LOCALES, TIMEZONES, BROWSER_LOCALE, BROWSER_TZ } from "./constants";
import { SettingsCard } from "./SettingsCard";
import type { ProfileForm } from "./useProfileForm";
import classes from "./Profile.module.css";

export function DateTimeFields({ form }: { form: ProfileForm }) {
  const { t } = useTranslation();
  const { dateLocale, setDateLocale, timezone, setTimezone, preview } = form;

  return (
    <SettingsCard icon={CalendarClock} title={t("settings.datesTitle")} description={t("settings.datesDesc")}>
      <Box className={classes.grid}>
        <Select
          label={t("settings.dateFormat")}
          description={
            !dateLocale && BROWSER_LOCALE
              ? t("settings.dateFormatHintDetected", { value: BROWSER_LOCALE })
              : t("settings.dateFormatHint")
          }
          data={LOCALES}
          value={dateLocale}
          onChange={(v) => setDateLocale(v ?? "")}
          allowDeselect={false}
          comboboxProps={{ withinPortal: true, radius: "md" }}
        />
        <Select
          label={t("settings.timezone")}
          description={
            !timezone && BROWSER_TZ
              ? t("settings.timezoneHintDetected", { value: BROWSER_TZ })
              : t("settings.timezoneHint")
          }
          data={TIMEZONES}
          value={timezone}
          onChange={(v) => setTimezone(v ?? "")}
          allowDeselect={false}
          searchable
          comboboxProps={{ withinPortal: true, radius: "md" }}
        />
      </Box>

      <Box className={classes.preview}>
        <span className={classes.previewLabel}>{t("settings.preview")}</span>
        <span className={classes.previewValue}>{preview}</span>
      </Box>
    </SettingsCard>
  );
}
