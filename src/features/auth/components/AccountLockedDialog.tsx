import { useEffect, useState } from "react";
import { ActionIcon, Group, Modal, Stack, Text } from "@mantine/core";
import { X } from "lucide-react";
import bannerSrc from "@/assets/banners/account-locked-banner.png";

function remainingParts(ms: number): { value: string; unit: string }[] {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  const parts = [{ value: pad(h), unit: "hrs" }, { value: pad(m), unit: "min" }, { value: pad(s), unit: "sec" }];
  return h > 0 ? parts : parts.slice(1);
}


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

  const parts = remainingParts(remaining);

  return (
    <Modal
      opened
      onClose={onClose}
      radius="lg"
      size={480}
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
          onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, zIndex: 10 }}
        >
          <X size={16} style={{ pointerEvents: "none", color: "#fff" }} />
        </ActionIcon>

        <div
          className="verify-rise"
          style={{
            height: 168,
            backgroundImage: `url(${bannerSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <Stack gap={0} px={30} py={26}>
          <Text size="xs" c="dimmed" ta="center" tt="uppercase" fw={600} style={{ letterSpacing: 1 }}>
            Time remaining
          </Text>

          <Group
            justify="center"
            gap={10}
            wrap="nowrap"
            align="flex-start"
            mt={14}
            className="verify-rise"
            style={{ animationDelay: "90ms" }}
          >
            {parts.map((p, i) => (
              <Group key={p.unit} gap={10} wrap="nowrap" align="flex-start">
                <Stack gap={2} align="center">
                  <Text
                    fw={800}
                    size="42px"
                    style={{
                      fontVariantNumeric: "tabular-nums",
                      lineHeight: 1,
                      backgroundImage: "linear-gradient(180deg, var(--mantine-color-text) 0%, var(--mantine-color-dimmed) 140%)",
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {p.value}
                  </Text>
                  <Text size="10px" c="dimmed" tt="uppercase" fw={600} style={{ letterSpacing: 0.8 }}>
                    {p.unit}
                  </Text>
                </Stack>
                {i < parts.length - 1 && (
                  <Text size="28px" fw={700} c="dimmed" mt={2} style={{ opacity: 0.35 }}>:</Text>
                )}
              </Group>
            ))}
          </Group>

          <Text
            size="xs"
            c="dimmed"
            ta="center"
            mt={22}
            className="verify-rise"
            style={{ animationDelay: "120ms" }}
          >
            If this wasn't you, someone else may know your password — change
            it once the lock lifts.
          </Text>
        </Stack>
      </Stack>
    </Modal>
  );
}
