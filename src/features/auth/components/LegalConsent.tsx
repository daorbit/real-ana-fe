import { Anchor, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { LEGAL_URLS } from "@/shared/lib/docsSlugs";

export function LegalConsent() {
  const { t } = useTranslation();
  return (
    <Text c="dimmed" size="xs" ta="center" lh={1.5}>
      {t("auth.legalConsent", "By continuing, you agree to our")}{" "}
      <Anchor href={LEGAL_URLS.terms} target="_blank" rel="noreferrer" size="xs" inherit>
        {t("legal.terms", "Terms of Service")}
      </Anchor>{" "}
      {t("auth.legalAnd", "and")}{" "}
      <Anchor href={LEGAL_URLS.privacy} target="_blank" rel="noreferrer" size="xs" inherit>
        {t("legal.privacy", "Privacy Policy")}
      </Anchor>
      .
    </Text>
  );
}
