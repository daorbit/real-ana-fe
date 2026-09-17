import { useState } from "react";
import { ActionIcon, Box, Button, Modal, PinInput, Stack, Text, TextInput } from "@mantine/core";
import { X } from "lucide-react";
import { errMessage } from "@/shared/lib/notify";
import { SupportRequestModal } from "@/app/shell/SupportRequestModal";
import bannerSrc from "@/assets/banners/totp-verify-banner.png";


export function TotpPrompt({
  opened,
  busy,
  onSubmit,
  onCancel,
}: {
  opened: boolean;
  busy: boolean;
  onSubmit: (code: string) => Promise<void>;
  onCancel: () => void;
}) {
  const [code, setCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportOpen, setSupportOpen] = useState(false);

  const submit = async (value = code) => {
    if (!value.trim()) return;
    setError(null);
    try {
      await onSubmit(value.trim());
    } catch (err) {
      setError(errMessage(err, "That code didn't work — try again."));
    }
  };

  const switchMode = () => {
    setUseBackup((v) => !v);
    setCode("");
    setError(null);
  };

  return (
    <>
    <SupportRequestModal opened={supportOpen} onClose={() => setSupportOpen(false)} />
    <Modal
      opened={opened}
      onClose={onCancel}
      radius="lg"
      size={440}
      centered
      padding={0}
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.65, blur: 6 }}
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      <Stack gap={0} className="verify-card" pos="relative">
        <ActionIcon
          variant="subtle"
          color="gray"
          size="sm"
          onClick={onCancel}
          style={{ position: "absolute", top: 14, right: 14, zIndex: 10 }}
        >
          <X size={16} style={{ pointerEvents: "none", color: "#fff" }} />
        </ActionIcon>

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
            {useBackup
              ? "Enter one of the backup codes you saved when you turned on two-factor authentication."
              : "Open your authenticator app and enter the 6-digit code for Quantalog."}
          </Text>
        </Stack>

        <Stack gap={14} mt={22} px={26} align="center" className="verify-rise" style={{ animationDelay: "90ms" }}>
          {useBackup ? (
            <TextInput
              w="100%"
              placeholder="XXXX-XXXX"
              size="md"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && void submit()}
              disabled={busy}
              styles={{ input: { textAlign: "center", letterSpacing: 2 } }}
            />
          ) : (
            <PinInput
              length={6}
              type="number"
              size="lg"
              radius="md"
              autoFocus
              value={code}
              onChange={setCode}
              onComplete={(value) => void submit(value)}
              disabled={busy}
            />
          )}

          <Button
            fullWidth
            size="md"
            loading={busy}
            onClick={() => void submit()}
            disabled={!code.trim()}
          >
            Verify
          </Button>
        </Stack>

        <Box px={26} pb={24}>
          {error && (
            <Text mt={12} size="xs" c="red" ta="center" className="verify-rise" style={{ animationDelay: "110ms" }}>
              {error}
            </Text>
          )}

          <Box mt={18} ta="center" className="verify-rise" style={{ animationDelay: "150ms" }}>
            <Text
              component="button"
              type="button"
              onClick={switchMode}
              size="xs"
              fw={500}
              className="verify-cancel"
            >
              {useBackup ? "Use an authenticator code instead" : "Use a backup code instead"}
            </Text>
          </Box>

          <Box mt={10} ta="center" className="verify-rise" style={{ animationDelay: "170ms" }}>
            <Text
              component="button"
              type="button"
              onClick={() => setSupportOpen(true)}
              size="xs"
              fw={500}
              className="verify-cancel"
            >
              Lost access to both? Contact support
            </Text>
          </Box>
        </Box>
      </Stack>
    </Modal>
    </>
  );
}
