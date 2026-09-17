import { Box, Modal, Stack, Text } from "@mantine/core";
import TurnstileWidget from "./TurnstileWidget";
import bannerSrc from "@/assets/banners/security-check-banner.png";

/**
 * The bot check, between pressing sign in and being signed in.
 *
 * Deliberately calm: this interrupts someone who has already typed their
 * password and is expecting to be let in, so it explains itself in one line
 * and gets out of the way.
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
      size={440}
      centered
      padding={0}
      overlayProps={{ backgroundOpacity: 0.65, blur: 6 }}
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      {/* One column of stacked blocks, no rules between them: the dividers cut
          the card into strips and made a two-line dialog look like a form.
          Spacing separates the parts instead. */}
      <Stack gap={0} className="verify-card" pos="relative">
        <div
          className="verify-rise"
          style={{
            height: 154,
            backgroundImage: `url(${bannerSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Stack gap={3} px={26} pt={18} className="verify-rise">
          <Text size="xs" c="dimmed" lh={1.5}>
            You'll be signed in automatically once it clears.
          </Text>
        </Stack>

        <Box
          mt={20}
          px={22}
          className="verify-rise"
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

        <Box mt={16} pb={24} ta="center" className="verify-rise" style={{ animationDelay: "150ms" }}>
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
