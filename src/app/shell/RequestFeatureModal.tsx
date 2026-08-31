import { Box, Modal } from "@mantine/core";
import { useTranslation } from "react-i18next";

const FORM_URL = "https://forms.daorbit.in/form/6a9566fff4f4fb14f6082131/view";

/**
 * The hosted feature-request form, shown in a modal so the user stays in the
 * app rather than bouncing to a new tab. Opened from the account menu.
 */
export function RequestFeatureModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const title = t("nav.requestFeature", "Request a feature");

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={title}
      size="lg"
      radius="md"
      zIndex={500}
      centered
    >
      <Box
        component="iframe"
        src={FORM_URL}
        title={title}
        style={{ width: "100%", height: "70vh", border: 0, borderRadius: 8 }}
      />
    </Modal>
  );
}
