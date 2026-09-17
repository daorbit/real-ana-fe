import { useEffect, useState } from "react";
import { Box, Button, Modal, PinInput, Stack, Text, TextInput } from "@mantine/core";
import { Lock } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { subscribeLock, isLocked } from "@/shared/lib/lockState";
import { errMessage } from "@/shared/lib/notify";

/**
 * The idle lock overlay. Deliberately not dismissible any way but a correct
 * PIN or TOTP code: no close button, no click-outside, no Escape — the point
 * is that the account is actually locked server-side (`requireUnlocked`
 * rejects every data route until `/api/auth/unlock` clears it), so a client
 * that let this modal be closed without that call would just be showing a
 * decoration in front of a still-working app for everyone except this one.
 */
export function LockScreen() {
  const { user, unlockScreen } = useAuth();
  const [visible, setVisible] = useState(isLocked());
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"pin" | "totp">(user?.totpEnabled ? "totp" : "pin");

  useEffect(() => subscribeLock(setVisible), []);

  useEffect(() => {
    if (visible) {
      setCode("");
      setError(null);
      setMode(user?.totpEnabled ? "totp" : "pin");
    }
  }, [visible, user?.totpEnabled]);

  if (!visible || !user) return null;

  const submit = async (value = code) => {
    if (!value.trim()) return;
    setBusy(true);
    setError(null);
    try {
      await unlockScreen(mode === "pin" ? { pin: value.trim() } : { totpCode: value.trim() });
      setCode("");
    } catch (err) {
      setError(errMessage(err, "That didn't work — try again."));
    } finally {
      setBusy(false);
    }
  };

  const canSwitchToTotp = Boolean(user.totpEnabled);
  const canSwitchToPin = Boolean(user.hasPin);

  return (
    <Modal
      opened
      onClose={() => {}}
      radius="lg"
      size={380}
      centered
      padding={0}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      overlayProps={{ backgroundOpacity: 0.85, blur: 10 }}
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      <Stack gap={0} px={28} py={30} align="center">
        <Box
          style={{
            width: 44, height: 44, borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--mantine-color-default-hover)",
          }}
        >
          <Lock size={20} strokeWidth={2.25} />
        </Box>

        <Text fw={650} size="md" mt={16}>Session locked</Text>
        <Text size="xs" c="dimmed" mt={4} ta="center">
          You've been idle a while. {mode === "pin" ? "Enter your PIN" : "Enter your authenticator code"} to continue.
        </Text>

        <Stack gap={14} mt={22} align="center" w="100%">
          {mode === "pin" ? (
            <PinInput
              length={4}
              mask
              type="number"
              size="lg"
              radius="md"
              autoFocus
              value={code}
              onChange={setCode}
              onComplete={(value) => void submit(value)}
              disabled={busy}
            />
          ) : (
            <TextInput
              w="100%"
              placeholder="6-digit code"
              size="md"
              autoFocus
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && void submit()}
              disabled={busy}
              styles={{ input: { textAlign: "center", letterSpacing: 2 } }}
            />
          )}

          <Button fullWidth size="md" loading={busy} disabled={!code.trim()} onClick={() => void submit()}>
            Unlock
          </Button>
        </Stack>

        {error && (
          <Text mt={12} size="xs" c="red" ta="center">{error}</Text>
        )}

        {canSwitchToTotp && canSwitchToPin && (
          <Text
            component="button"
            type="button"
            mt={16}
            size="xs"
            fw={500}
            c="dimmed"
            style={{ background: "none", border: "none", cursor: "pointer" }}
            onClick={() => { setMode((m) => (m === "pin" ? "totp" : "pin")); setCode(""); setError(null); }}
          >
            {mode === "pin" ? "Use an authenticator code instead" : "Use your PIN instead"}
          </Text>
        )}
      </Stack>
    </Modal>
  );
}
