import { Box, TextInput } from "@mantine/core";
import { Lock, UserRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import { mobileError } from "./constants";
import { SettingsCard } from "./SettingsCard";
import type { ProfileForm } from "./useProfileForm";
import classes from "./Profile.module.css";

export function ProfileFields({ form }: { form: ProfileForm }) {
  const { t } = useTranslation();
  const {
    user,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    mobile,
    setMobile,
    errors,
    clearIfValid,
    validateOnBlur,
    errText,
  } = form;

  const nameRequired = (s: string) => (s.trim() ? null : "settings.firstNameRequired");

  if (!user) return null;

  return (
    <SettingsCard icon={UserRound} title={t("settings.profile")} description={t("settings.profileDesc")}>
      <Box className={classes.grid}>
        <TextInput
          label={t("settings.firstName")}
          withAsterisk
          value={firstName}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setFirstName(v);
            clearIfValid("firstName", nameRequired, v);
          }}
          onBlur={(e) => validateOnBlur("firstName", nameRequired, e.currentTarget.value)}
          error={errText(errors.firstName)}
        />
        <TextInput
          label={t("settings.lastName")}
          value={lastName}
          onChange={(e) => setLastName(e.currentTarget.value)}
        />
        <TextInput
          label={t("settings.email")}
          description={t("settings.emailHint")}
          value={user.email}
          disabled
          rightSection={<Lock size={14} />}
        />
        <TextInput
          label={t("settings.mobile")}
          description={t("common.optional")}
          placeholder="+91 98765 43210"
          value={mobile}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setMobile(v);
            clearIfValid("mobile", mobileError, v);
          }}
          onBlur={(e) => validateOnBlur("mobile", mobileError, e.currentTarget.value)}
          error={errText(errors.mobile)}
        />
      </Box>
    </SettingsCard>
  );
}
