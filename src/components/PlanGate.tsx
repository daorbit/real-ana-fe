import { Button, Center, Stack, Text, ThemeIcon } from "@mantine/core";
import { Link } from "react-router-dom";
import { Lock } from "lucide-react";
import "./PlanGate.css";

/**
 * Blurs `children` and overlays an upgrade prompt when `locked` is true.
 * Content stays mounted (blurred, not removed) so layout doesn't jump once
 * the plan check resolves.
 */
export function PlanGate({
  locked,
  title,
  body,
  children,
}: {
  locked: boolean;
  title: string;
  body: string;
  children: React.ReactNode;
}) {
  if (!locked) return <>{children}</>;

  return (
    <div className="plan-gate">
      <div className="plan-gate__content" aria-hidden>
        {children}
      </div>
      <div className="plan-gate__overlay">
        <Center h="100%">
          <Stack align="center" gap={8} maw={360}>
            <ThemeIcon variant="light" color="emerald" size={44} radius="xl">
              <Lock size={20} />
            </ThemeIcon>
            <Text fw={650}>{title}</Text>
            <Text size="sm" c="dimmed" ta="center">
              {body}
            </Text>
            <Button component={Link} to="/app/billing" color="emerald" mt="xs">
              Upgrade plan
            </Button>
          </Stack>
        </Center>
      </div>
    </div>
  );
}
