import { TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Section, Field } from "@/shared/ui/Page";
import { mobileError } from "./constants";
import type { ProfileForm } from "./useProfileForm";

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
    errText,
  } = form;

  if (!user) return null;

  return (
    <Section title={t("settings.profile")} description={t("settings.profileDesc")}>
      <Field label={t("settings.firstName")} hint={t("common.required")}>
        <TextInput
          value={firstName}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setFirstName(v);
            clearIfValid("firstName", (s) => (s.trim() ? null : "x"), v);
          }}
          error={errText(errors.firstName)}
        />
      </Field>
      <Field label={t("settings.lastName")}>
        <TextInput
          value={lastName}
          onChange={(e) => setLastName(e.currentTarget.value)}
        />
      </Field>
      <Field label={t("settings.email")} hint={t("settings.emailHint")}>
        <TextInput value={user.email} disabled />
      </Field>
      <Field label={t("settings.mobile")} hint={t("common.optional")} last>
        <TextInput
          placeholder="+91 98765 43210"
          value={mobile}
          onChange={(e) => {
            const v = e.currentTarget.value;
            setMobile(v);
            clearIfValid("mobile", mobileError, v);
          }}
          error={errText(errors.mobile)}
        />
      </Field>
    </Section>
  );
}
