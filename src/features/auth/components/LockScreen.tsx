import { useEffect, useRef, useState } from "react";
import { Button, Modal, PinInput, Stack, Text, TextInput } from "@mantine/core";
import { useAuth } from "@/features/auth/context";
import { subscribeLock, isLocked } from "@/shared/lib/lockState";
import { errMessage } from "@/shared/lib/notify";
import { SupportRequestModal } from "@/app/shell/SupportRequestModal";
import bannerSrc from "@/assets/banners/session-locked-banner.png";


export function LockScreen() {
  const { user, unlockScreen } = useAuth();
  const [visible, setVisible] = useState(isLocked());
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"pin" | "totp">(user?.totpEnabled ? "totp" : "pin");
  const [supportOpen, setSupportOpen] = useState(false);
  const pinRef = useRef<HTMLInputElement>(null);
  const totpRef = useRef<HTMLInputElement>(null);

  useEffect(() => subscribeLock(setVisible), []);

  useEffect(() => {
    if (visible) {
      setCode("");
      setError(null);
      setMode(user?.totpEnabled ? "totp" : "pin");
    }
  }, [visible, user?.totpEnabled]);

  // Mantine's Modal runs its own focus-trap on mount, which grabs focus after
  // the input's own `autoFocus` effect has already run — the trap wins the
  // race, and the modal's outer element ends up focused instead, which is
  // what shows as a ring around the card rather than a cursor in the field.
  // Focusing again a tick later, once the trap has settled, wins for real.
  useEffect(() => {
    if (!visible) return;
    const id = requestAnimationFrame(() => {
      (mode === "pin" ? pinRef.current : totpRef.current)?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [visible, mode]);

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
    <>
    <SupportRequestModal opened={supportOpen} onClose={() => setSupportOpen(false)} />
    <Modal
      opened
      onClose={() => {}}
      radius="lg"
      size={440}
      centered
      padding={0}
      withCloseButton={false}
      closeOnClickOutside={false}
      closeOnEscape={false}
      overlayProps={{ backgroundOpacity: 0.5, blur: 10 }}
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      <Stack gap={0} className="verify-card">
        <div
          className="verify-rise"
          style={{
            height: 154,
            backgroundImage: `url(${bannerSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Stack gap={0} px={28} py={26} align="center">
        <Text size="xs" c="dimmed" ta="center">
          {mode === "pin" ? "Enter your PIN" : "Enter your authenticator code"} to continue.
        </Text>

        <Stack gap={14} mt={18} align="center" w="100%">
          {mode === "pin" ? (
            <PinInput
              ref={pinRef}
              length={4}
              mask
              type="number"
              size="lg"
              radius="md"
              value={code}
              onChange={setCode}
              onComplete={(value) => void submit(value)}
              disabled={busy}
            />
          ) : (
            <TextInput
              ref={totpRef}
              w="100%"
              placeholder="6-digit code"
              size="md"
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

        <Text
          component="button"
          type="button"
          mt={canSwitchToTotp && canSwitchToPin ? 8 : 16}
          size="xs"
          fw={500}
          c="dimmed"
          style={{ background: "none", border: "none", cursor: "pointer" }}
          onClick={() => setSupportOpen(true)}
        >
          Lost your PIN or authenticator? Contact support
        </Text>
        </Stack>
      </Stack>
    </Modal>
    </>
  );
}
