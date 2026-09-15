import { Text, Group, Button, Stack, Badge } from "@mantine/core";
import { ArrowUpCircle, Lock } from "lucide-react";
import type { ReactNode } from "react";
import "./UpgradeDialog.css";

/** What the server said about the cap that was hit. Every field is optional. */
export interface UpgradeLimit {
  kind?: string;
  label?: string;
  used?: number;
  quota?: number;
  plan?: string;
}

/**
 * The body of the upgrade dialog.
 *
 * Split from `notify.quotaLimit` so the dialog is a component with its own
 * stylesheet rather than markup nested inside a helper — the two are edited for
 * different reasons, and only one of them is about how a limit looks.
 */
export function UpgradeDialog({
  message,
  limit,
  reason,
  onDismiss,
  onUpgrade,
}: {
  message: ReactNode;
  limit?: UpgradeLimit;
  /** Why the upgrade is being asked for: an allowance that ran out, or a
   * feature this plan does not include. Decides the heading. */
  reason?: "quota_exceeded" | "plan_required";
  onDismiss: () => void;
  onUpgrade: () => void;
}) {
  // A spent allowance and a feature the plan never had are different things to
  // be told. "You've reached your … limit" is only true of the first: said
  // about the second it describes a limit that was never approached, and the
  // obvious reading — wait for the period to reset — is wrong.
  const heading = !limit?.label
    ? "Upgrade to unlock this"
    : reason === "plan_required"
      ? `${limit.label} is part of a higher plan`
      : `You've reached your ${limit.label} limit`;
  const showMeter = typeof limit?.used === "number" && typeof limit?.quota === "number";

  return (
    <div className="upgrade-dialog">
      <div className="aurora-wash" />
      <Stack className="upgrade-dialog__body" align="center" gap="lg">
        <div className="upgrade-dialog__seal">
          <Lock size={24} strokeWidth={1.8} />
        </div>

        <Stack align="center" gap={10}>
          {limit?.plan && (
            <Badge size="sm" radius="sm" variant="light" color="emerald">
              {limit.plan} plan
            </Badge>
          )}
          <Text fw={680} size="lg" ta="center" lh={1.25}>
            {heading}
          </Text>
        </Stack>

        <Text size="sm" c="dimmed" ta="center" maw={320} lh={1.5}>
          {message}
        </Text>

        {showMeter && (
          <Stack gap={10} w="100%" maw={300}>
            <div className="upgrade-dialog__meter">
              <div className="upgrade-dialog__meter-fill" />
            </div>
            <Group justify="space-between" gap="xs">
              <Text size="xs" c="dimmed">
                {limit.used} of {limit.quota} used
              </Text>
              <Text size="xs" c="emerald" fw={600}>
                Limit reached
              </Text>
            </Group>
          </Stack>
        )}

        <Group mt={4} gap="sm">
          <Button variant="subtle" color="gray" onClick={onDismiss}>
            Not now
          </Button>
          <Button color="emerald" leftSection={<ArrowUpCircle size={15} />} onClick={onUpgrade}>
            Upgrade plan
          </Button>
        </Group>
      </Stack>
    </div>
  );
}
