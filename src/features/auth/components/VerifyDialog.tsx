import { Box, Modal, Stack, Text } from "@mantine/core";
import { ShieldCheck } from "lucide-react";
import TurnstileWidget from "./TurnstileWidget";

/**
 * The bot check, between pressing sign in and being signed in.
 *
 * Deliberately calm: this interrupts someone who has already typed their
 * password and is expecting to be let in, so it explains itself in one line and
 * gets out of the way. The shield animates while the check runs, because a
 * dialog that appears and then sits still reads as something that has hung.
 *
 * No close button. Dismissing it would abandon a sign-in already in progress
 * with nothing to show for it — the escape route is the cancel line at the
 * bottom, which says what it does.
 */
export function VerifyDialog({
  opened,
  onCancel,
  onVerify,
}: {
  opened: boolean;
  onCancel: () => void;
  onVerify: (token: string) => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      withCloseButton={false}
      radius="lg"
      size={380}
      centered
      padding={0}
      overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
      transitionProps={{ transition: "pop", duration: 220 }}
    >
      <Stack gap={0} p={26} align="center">
        <Box className="verify-shield" mb={16}>
          <span className="verify-shield__pulse" />
          <ShieldCheck size={26} />
        </Box>

        <Text fw={650} size="md" ta="center">Just checking you're human</Text>
        <Text size="sm" c="dimmed" ta="center" mt={6} lh={1.55} maw={280}>
          It takes a second, and it keeps everyone's account safer. You'll be
          signed in automatically.
        </Text>

        <Box mt={20} style={{ minHeight: 65 }}>
          <TurnstileWidget
            onVerify={onVerify}
            // Expiry and errors both mean there is no usable token. The dialog
            // stays open — the widget re-challenges itself, and closing it
            // would look like the sign-in had been cancelled.
            onExpire={() => {}}
          />
        </Box>

        <Text
          component="button"
          type="button"
          onClick={onCancel}
          size="xs"
          c="dimmed"
          mt={18}
          className="verify-cancel"
        >
          Cancel and go back
        </Text>
      </Stack>
    </Modal>
  );
}
