import { Box, Group, Modal, Stack, Text } from "@mantine/core";
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
 * It cannot be dismissed by clicking the overlay or pressing Escape, and there
 * is no close button — a stray click should never abandon a sign-in already in
 * progress. The only way out is the cancel line at the bottom, which says what
 * it does.
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
      closeOnClickOutside={false}
      closeOnEscape={false}
      radius="lg"
      size={400}
      centered
      padding={0}
      overlayProps={{ backgroundOpacity: 0.65, blur: 6 }}
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      {/* One column of stacked blocks, no rules between them: the dividers cut
          a 400px card into three strips and made a two-line dialog look like a
          form. Spacing separates the parts instead. */}
      <Stack gap={0} className="verify-card" px={26} py={24}>
        <Group gap={13} wrap="nowrap" align="flex-start" className="verify-rise">
          <Box className="verify-shield">
            <span className="verify-shield__spin" />
            <ShieldCheck size={19} strokeWidth={2.25} />
          </Box>
          <Stack gap={3}>
            <Text fw={650} size="sm">Quick security check</Text>
            <Text size="xs" c="dimmed" lh={1.5}>
              One tap to confirm you're human. You'll be signed in automatically
              once it clears.
            </Text>
          </Stack>
        </Group>

        <Box
          mt={20}
          className="verify-slot verify-rise"
          style={{ animationDelay: "90ms" }}
        >
          <TurnstileWidget
            onVerify={onVerify}
            // Expiry and errors both mean there is no usable token. The dialog
            // stays open — the widget re-challenges itself, and closing it
            // would look like the sign-in had been cancelled.
            onExpire={() => {}}
          />
        </Box>

        <Box mt={16} ta="center" className="verify-rise" style={{ animationDelay: "150ms" }}>
          <Text
            component="button"
            type="button"
            onClick={onCancel}
            size="xs"
            fw={500}
            className="verify-cancel"
          >
            Cancel and go back
          </Text>
        </Box>
      </Stack>
    </Modal>
  );
}
