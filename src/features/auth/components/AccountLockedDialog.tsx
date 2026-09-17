import { useEffect, useState } from "react";
import { Box, Modal, Stack, Text } from "@mantine/core";
import { ShieldAlert } from "lucide-react";

/** mm:ss for under an hour, hh:mm:ss once there's an hour or more left —
 * a 12-hour lock spends almost its whole life in the second form. */
function formatRemaining(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

/**
 * Shown when /login answers 423: five wrong passwords in a row locked the
 * account for 12 hours. A countdown rather than a static message so "try
 * again later" has an actual number behind it — and closes itself once the
 * lock has actually lifted, since re-showing a stale "locked" state after the
 * time has passed would just be wrong.
 */
export function AccountLockedDialog({
  lockedUntil,
  onClose,
}: {
  lockedUntil: Date | null;
  onClose: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!lockedUntil) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [lockedUntil]);

  if (!lockedUntil) return null;

  const remaining = lockedUntil.getTime() - now;
  if (remaining <= 0) {
    onClose();
    return null;
  }

  return (
    <Modal
      opened
      onClose={onClose}
      radius="lg"
      size={400}
      centered
      padding={0}
      overlayProps={{ backgroundOpacity: 0.65, blur: 6 }}
      transitionProps={{ transition: "pop", duration: 200 }}
    >
      <Stack gap={0} px={28} py={30} align="center">
        <Box
          style={{
            width: 48, height: 48, borderRadius: 14,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "var(--mantine-color-red-light)",
          }}
        >
          <ShieldAlert size={22} strokeWidth={2.25} color="var(--mantine-color-red-6)" />
        </Box>

        <Text fw={700} size="lg" mt={16}>Your account is locked</Text>
        <Text size="sm" c="dimmed" mt={6} ta="center" maw={300}>
          Too many wrong passwords in a row. For your security, sign-in is
          paused until the timer below runs out.
        </Text>

        <Box
          mt={22}
          px={28}
          py={16}
          style={{
            borderRadius: 14,
            background: "var(--mantine-color-default-hover)",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          <Text fw={700} size="32px" ta="center" style={{ letterSpacing: 1 }}>
            {formatRemaining(remaining)}
          </Text>
        </Box>

        <Text size="xs" c="dimmed" mt={18} ta="center">
          If this wasn't you, someone else may know your password — change it
          as soon as the lock lifts.
        </Text>
      </Stack>
    </Modal>
  );
}
