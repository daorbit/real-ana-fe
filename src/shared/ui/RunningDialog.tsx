import { Modal, Stack, Text, Box, Button, Group, UnstyledButton, Portal } from "@mantine/core";
import { Check, Minimize2, Maximize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { RunningSteps } from "@/shared/ui/RunningSteps";
import "@/shared/ui/RunningDialog.css";

const SUCCESS_HOLD = 2600;


export function RunningDialog({
  opened,
  title,
  description,
  steps,
  minimizable = true,
  minimizedLabel,
  successMessage = "Done",
}: {
  opened: boolean;
  title: string;
  description?: ReactNode;
  /** Optional rotating status lines, ~3s each, held on the last one. */
  steps?: string[];
  /** Show the minimize control. */
  minimizable?: boolean;
  /** One-liner for the docked pill. Defaults to `title`. */
  minimizedLabel?: string;
  /** Shown in the pill for a moment after a minimized job finishes. */
  successMessage?: string;
}) {
  const [step, setStep] = useState(0);
  const [minimized, setMinimized] = useState(false);
  const [done, setDone] = useState(false);
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!opened || !steps?.length) return;
    setStep(0);
    const id = setInterval(
      () => setStep((s) => (s + 1 < steps.length ? s + 1 : s)),
      3000
    );
    return () => clearInterval(id);
  }, [opened, steps]);

  useEffect(() => {
    if (opened) {
      // A fresh run always starts expanded.
      if (!wasOpen.current) {
        wasOpen.current = true;
        setMinimized(false);
        setDone(false);
      }
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    if (!minimized) return;
    setDone(true);
    const id = setTimeout(() => {
      setDone(false);
      setMinimized(false);
    }, SUCCESS_HOLD);
    return () => clearTimeout(id);
  }, [opened, minimized]);

  const showPill = (opened && minimized) || done;

  return (
    <>
      <Modal
        opened={opened && !minimized}
        onClose={() => setMinimized(true)}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={minimizable}
        centered
        radius="lg"
        padding={0}
        size={380}
        overlayProps={{ blur: 6, backgroundOpacity: 0.55 }}
        classNames={{ content: "running-dialog__content" }}
      >
        <Box className="running-dialog">
          <Stack align="center" gap="md" p="lg" pt="xl">
            <Stack align="center" gap={6}>
              <Text fw={650} fz="lg" ta="center">
                {title}
              </Text>
              {description && (
                <Text size="sm" c="dimmed" ta="center" lh={1.5}>
                  {description}
                </Text>
              )}
            </Stack>

            {steps?.length ? <RunningSteps steps={steps} active={step} /> : null}

            {minimizable && (
              <Button
                variant="default"
                size="xs"
                radius="xl"
                leftSection={<Minimize2 size={14} />}
                onClick={() => setMinimized(true)}
              >
                Minimize — keep working
              </Button>
            )}
          </Stack>
        </Box>
      </Modal>

      {showPill && (
        <Portal>
          <UnstyledButton
            className={`running-pill${done ? " running-pill--done" : ""}`}
            onClick={() => !done && setMinimized(false)}
            aria-live="polite"
            title={done ? successMessage : "Show details"}
          >
            {done ? (
              <span className="running-pill__icon running-pill__icon--check">
                <Check size={13} strokeWidth={3} />
              </span>
            ) : (
              <span className="running-pill__icon running-pill__icon--spin" />
            )}

            <Group gap={8} wrap="nowrap" style={{ minWidth: 0 }}>
              <Text size="sm" fw={500} truncate>
                {done ? successMessage : minimizedLabel ?? title}
              </Text>
              {!done && <Maximize2 size={13} opacity={0.5} />}
            </Group>

            {!done && <span className="running-pill__line" />}
          </UnstyledButton>
        </Portal>
      )}
    </>
  );
}
