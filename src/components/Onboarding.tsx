import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card, Group, Text, Stack, ThemeIcon, Progress, Button, ActionIcon, Badge,
} from "@mantine/core";
import { Check, Circle, Rocket, X, ArrowRight } from "lucide-react";

type Step = {
  label: string;
  desc: string;
  done: boolean;
  /** Call to action for the first step that isn't done yet. */
  cta?: { label: string; to: string };
};

const DISMISS_KEY = "quantalog_onboarding_dismissed";

/**
 * Getting-started checklist for new workspaces. Walks a user from an empty
 * account to their first live pageview, then bows out on its own. It also
 * remembers a manual dismissal, so someone who closes it never sees it again.
 */
export function Onboarding({
  hasWorkspace,
  hasSite,
  hasData,
}: {
  hasWorkspace: boolean;
  hasSite: boolean;
  /** First pageview has landed — the snippet is confirmed working. */
  hasData: boolean;
}) {
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === "1"
  );

  const steps: Step[] = [
    {
      label: "Create a workspace",
      desc: "A home for your sites and team.",
      done: hasWorkspace,
      cta: { label: "Create workspace", to: "/app/workspaces" },
    },
    {
      label: "Add a site",
      desc: "Register the property you want to track.",
      done: hasSite,
      cta: { label: "Add a site", to: "/app/workspaces" },
    },
    {
      label: "Install the tracking snippet",
      desc: "Paste one script tag into your site's <head>.",
      done: hasData,
      cta: { label: "Get the snippet", to: "/app/workspaces" },
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const allDone = doneCount === steps.length;

  // Vanish once finished, or once the user closes it.
  if (allDone || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
  };

  // The first unfinished step is the one we nudge toward.
  const next = steps.find((s) => !s.done);

  return (
    <Card withBorder radius="lg" padding="lg" mb="lg" style={{ position: "relative" }}>
      <ActionIcon
        variant="subtle"
        color="gray"
        size="sm"
        onClick={dismiss}
        aria-label="Dismiss getting started"
        style={{ position: "absolute", top: 12, right: 12 }}
      >
        <X size={15} />
      </ActionIcon>

      <Group gap="sm" mb="sm" wrap="nowrap">
        <ThemeIcon variant="light" color="emerald" radius="md" size="lg">
          <Rocket size={18} />
        </ThemeIcon>
        <div>
          <Text fw={650}>Get set up</Text>
          <Text size="xs" c="dimmed">
            {doneCount} of {steps.length} done — you're almost live.
          </Text>
        </div>
        <Badge ml="auto" mr={28} variant="light" color="emerald">
          {Math.round((doneCount / steps.length) * 100)}%
        </Badge>
      </Group>

      <Progress value={(doneCount / steps.length) * 100} size="sm" radius="xl" color="emerald" mb="md" />

      <Stack gap="sm">
        {steps.map((s) => {
          const isNext = s === next;
          return (
            <Group key={s.label} gap="sm" wrap="nowrap" align="flex-start">
              <ThemeIcon
                variant={s.done ? "filled" : "light"}
                color={s.done ? "emerald" : isNext ? "emerald" : "gray"}
                radius="xl"
                size="sm"
                mt={2}
              >
                {s.done ? <Check size={12} /> : <Circle size={10} />}
              </ThemeIcon>
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  size="sm"
                  fw={isNext ? 600 : 500}
                  td={s.done ? "line-through" : undefined}
                  c={s.done ? "dimmed" : undefined}
                >
                  {s.label}
                </Text>
                <Text size="xs" c="dimmed">{s.desc}</Text>
              </div>
              {isNext && s.cta && (
                <Button
                  component={Link}
                  to={s.cta.to}
                  size="xs"
                  variant="light"
                  rightSection={<ArrowRight size={13} />}
                  style={{ flexShrink: 0 }}
                >
                  {s.cta.label}
                </Button>
              )}
            </Group>
          );
        })}
      </Stack>
    </Card>
  );
}
