import { Button, Group } from "@mantine/core";
import { Ban, Gift, Undo2 } from "lucide-react";
import type { AdminReferral } from "@/shared/types";
import type { ReferralAction } from "../hooks/useReferralActions";

export function ReferralRowActions({
  referral,
  busy,
  onAct,
}: {
  referral: AdminReferral;
  busy: boolean;
  onAct: (referral: AdminReferral, action: ReferralAction) => void;
}) {
  if (referral.status === "pending") {
    return (
      <Group gap={6} justify="flex-end" wrap="nowrap">
        <Button size="xs" variant="light" color="teal" leftSection={<Gift size={13} />} loading={busy} onClick={() => onAct(referral, "reward")}>
          Reward
        </Button>
        <Button size="xs" variant="subtle" color="red" leftSection={<Ban size={13} />} disabled={busy} onClick={() => onAct(referral, "reject")}>
          Reject
        </Button>
      </Group>
    );
  }

  if (referral.status === "rewarded") {
    return (
      <Group justify="flex-end" wrap="nowrap">
        <Button size="xs" variant="subtle" color="gray" leftSection={<Undo2 size={13} />} loading={busy} onClick={() => onAct(referral, "revoke")}>
          Revoke
        </Button>
      </Group>
    );
  }

  return null;
}
