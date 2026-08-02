import { Modal, Stack, Text, Box, Button, Group, UnstyledButton, Portal } from "@mantine/core";
import { Check, Minimize2, Maximize2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import "./RunningDialog.css";

/** How long the success pill stays up after a minimized job finishes, in ms.
 *  Matches the CSS animation budget in RunningDialog.css. */
const SUCCESS_HOLD = 2600;

/**
 * A blocking "work in progress" dialog, with an escape hatch.
 *
 * Long jobs (a Lighthouse audit takes 20-60s) used to show a spinner inside
 * whichever button was pressed. With two entry points that meant two spinners
 * racing in different corners of the page and nothing explaining the wait.
 * One centred dialog says "the app is busy" once and cycles through what it is
 * actually doing.
 *
 * A minute is long enough that people want the page back, so the dialog can be
 * collapsed to a pill docked at the bottom of the viewport. The pill is a view
 * of `opened`, not a second piece of state, so collapsing never affects the job
 * underneath; when the job finishes it flips to a success line and leaves.
 */
export function RunningDialog({
  opened,
  title,
  description,
  icon,
  steps,
  minimizable = true,
  minimizedLabel,
  successMessage = "Done",
}: {
  opened: boolean;
  title: string;
  description?: ReactNode;
  icon?: ReactNode;
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

  // Finishing while minimized is the only case with nothing else on screen to
  // announce it, so the pill holds a success state for a beat before leaving.
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
        size={400}
        overlayProps={{ blur: 6, backgroundOpacity: 0.6 }}
        styles={{ content: { overflow: "hidden" } }}
      >
        <Box className="running-dialog">
          <div className="running-dialog__aurora" aria-hidden />

          <Stack align="center" gap="lg" p="xl" style={{ position: "relative" }}>
            <div className="running-dialog__orb">
              <div className="running-dialog__ring running-dialog__ring--outer" />
              <div className="running-dialog__ring running-dialog__ring--inner" />
              <div className="running-dialog__core">{icon}</div>
            </div>

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

            <div className="running-dialog__bar">
              <div className="running-dialog__bar-fill" />
            </div>

            {steps?.length ? (
              <Text
                key={step}
                size="xs"
                c="dimmed"
                fw={500}
                ta="center"
                className="running-dialog__step"
              >
                {steps[step]}
              </Text>
            ) : null}

            {minimizable && (
              <Button
                variant="subtle"
                color="gray"
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
