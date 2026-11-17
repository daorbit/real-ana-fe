import { Modal, Stack, Text, Box, Button } from "@mantine/core";
import { Minimize2 } from "lucide-react";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { RunningSteps } from "@/shared/ui/RunningSteps";
import { RunningPill } from "@/shared/ui/RunningPill";
import { useMinimizedRun } from "@/shared/hooks/useMinimizedRun";
import "@/shared/ui/RunningDialog.css";

export function RunningDialog({
  opened,
  title,
  description,
  steps,
  minimizable = true,
  minimizedLabel,
  successMessage = "Done",
  size = 380,
  children,
}: {
  opened: boolean;
  title: string;
  size?: number;
  children?: ReactNode;
  description?: ReactNode;
  steps?: string[];
  minimizable?: boolean;
  minimizedLabel?: string;
  successMessage?: string;
}) {
  const [step, setStep] = useState(0);
  const { expanded, showPill, done, minimize, restore } = useMinimizedRun(opened);

  useEffect(() => {
    if (!opened || !steps?.length) return;
    setStep(0);
    const id = setInterval(
      () => setStep((s) => (s + 1 < steps.length ? s + 1 : s)),
      3000
    );
    return () => clearInterval(id);
  }, [opened, steps]);

  return (
    <>
      <Modal
        opened={expanded}
        onClose={minimize}
        withCloseButton={false}
        closeOnClickOutside={false}
        closeOnEscape={minimizable}
        centered
        radius="lg"
        padding={0}
        size={size}
        overlayProps={{ blur: 6, backgroundOpacity: 0.55 }}
        classNames={{ content: "running-dialog__content" }}
        aria-label={title}
      >
        <Box className="running-dialog">
          {children}
          <Stack align="center" gap="md" p="lg" pt={children ? "xs" : "xl"}>
            {!children && (
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
            )}

            {!children && steps?.length ? <RunningSteps steps={steps} active={step} /> : null}

            {minimizable && (
              <Button
                variant="default"
                size="xs"
                radius="xl"
                leftSection={<Minimize2 size={14} />}
                onClick={minimize}
              >
                Minimize — keep working
              </Button>
            )}
          </Stack>
        </Box>
      </Modal>

      {showPill && (
        <RunningPill
          done={done}
          label={minimizedLabel ?? title}
          successMessage={successMessage}
          onRestore={restore}
        />
      )}
    </>
  );
}
