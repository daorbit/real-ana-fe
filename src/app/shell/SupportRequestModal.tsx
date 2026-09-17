import { Box, Modal } from "@mantine/core";
import { useTranslation } from "react-i18next";

const FORM_URL = "https://forms.daorbit.in/form/6aabb7b5969a550af691c542/view";


export function SupportRequestModal({
  opened,
  onClose,
}: {
  opened: boolean;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const title = t("nav.contactSupport", "Contact support");

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
        style={{ width: "100%", height: "min(640px, 75vh)", border: 0, borderRadius: 8 }}
      />
    </Modal>
  );
}
