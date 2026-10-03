import { useTranslation } from "react-i18next";
import { FormModal } from "@/shared/ui/FormModal";
import { FEATURE_REQUEST_FORM_URL } from "@/shared/lib/formLinks";

export function RequestFeatureModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <FormModal
      opened={opened}
      onClose={onClose}
      title={t("nav.requestFeature", "Request a feature")}
      url={FEATURE_REQUEST_FORM_URL}
    />
  );
}
