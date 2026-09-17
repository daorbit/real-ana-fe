import { Box, Modal } from "@mantine/core";
import { useTranslation } from "react-i18next";

const FORM_URL = "https://forms.daorbit.in/form/6aabb7b5969a550af691c542/view";

/**
 * The hosted support-request form, shown in a modal so the user stays in the
 * app rather than bouncing to a new tab. Opened from the account menu — this
 * is the general "I have an issue" route, including account lockouts an
 * admin has to reset by hand (lost 2FA with no backup codes, forgotten
 * screen-lock PIN).
 */
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
