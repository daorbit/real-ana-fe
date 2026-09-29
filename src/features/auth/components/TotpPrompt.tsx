import { useEffect, useRef, useState } from "react";
import { ActionIcon, Box, Button, Modal, PinInput, Stack, Text, TextInput } from "@mantine/core";
import { ShieldCheck, X } from "lucide-react";
import { errMessage } from "@/shared/lib/notify";
import { SupportRequestModal } from "@/app/shell/SupportRequestModal";
import classes from "./totpPrompt.module.css";


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
  const pinRef = useRef<HTMLInputElement>(null);
  const backupRef = useRef<HTMLInputElement>(null);

  // Mantine's Modal focus-trap grabs focus on mount after the input's own
  // `autoFocus` effect has already run, so the trap wins the race and the
  // modal's outer element ends up focused — visible as a ring around the
  // card rather than a cursor in the field. Focusing again a tick later, once
  // the trap has settled, wins for real.
  useEffect(() => {
    if (!opened) return;
    const id = requestAnimationFrame(() => {
      (useBackup ? backupRef.current : pinRef.current)?.focus();
    });
    return () => cancelAnimationFrame(id);
  }, [opened, useBackup]);

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
      size={420}
      centered
      padding={0}
      withCloseButton={false}
      classNames={{ content: classes.content }}
      overlayProps={{ backgroundOpacity: 0.55, blur: 8 }}
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      <Stack gap={0} className={classes.card} pos="relative">
        <ActionIcon
          variant="transparent"
          size={32}
          radius="xl"
          onClick={onCancel}
          aria-label="Close"
          className={classes.close}
        >
          <X size={16} />
        </ActionIcon>

        <Stack gap="md" align="center" className="verify-rise">
          <span className={classes.badge}>
            <ShieldCheck size={26} />
          </span>
          <h2 className={classes.title}>Two-step verification</h2>
          <Text className={classes.lede}>
            {useBackup
              ? "Enter one of the backup codes you saved when you turned on two-factor authentication."
              : "Open your authenticator app and enter the 6-digit code for Quantalog."}
          </Text>
        </Stack>

        <Stack gap={16} mt={26} align="center" className="verify-rise" style={{ animationDelay: "90ms" }}>
          {useBackup ? (
            <TextInput
              ref={backupRef}
              w="100%"
              placeholder="XXXX-XXXX"
              value={code}
              onChange={(e) => setCode(e.currentTarget.value)}
              onKeyDown={(e) => e.key === "Enter" && void submit()}
              disabled={busy}
              classNames={{ input: `${classes.pin} ${classes.backup}` }}
            />
          ) : (
            <PinInput
              ref={pinRef}
              length={6}
              type="number"
              size="lg"
              value={code}
              onChange={setCode}
              onComplete={(value) => void submit(value)}
              disabled={busy}
              classNames={{ input: classes.pin }}
            />
          )}

          <Button
            fullWidth
            className={classes.verify}
            loading={busy}
            onClick={() => void submit()}
            disabled={!code.trim()}
          >
            Verify
          </Button>
        </Stack>

        <Box>
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
              className={classes.link}
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
              className={classes.link}
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
