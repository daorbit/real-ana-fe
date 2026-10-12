import { ActionIcon, Switch, Text, Tooltip } from "@mantine/core";
import { LogIn } from "lucide-react";
import type { TopReferrer } from "@/shared/types";

export function ReferralLinkSwitch({
  referrer,
  toggling,
  onToggle,
}: {
  referrer: TopReferrer;
  toggling: boolean;
  onToggle: (userId: string, active: boolean) => void;
}) {
  const { user, code } = referrer;
  if (!user || !code) return <Text size="sm" c="dimmed">—</Text>;
  return (
    <Switch
      checked={code.active}
      disabled={toggling}
      onChange={(e) => onToggle(user.id, e.currentTarget.checked)}
      aria-label="Referral link active"
    />
  );
}

export function ImpersonateButton({
  referrer,
  busy,
  onEnter,
}: {
  referrer: TopReferrer;
  busy: boolean;
  onEnter: (user: { id: string; email: string }) => void;
}) {
  const { user } = referrer;
  if (!user) return null;
  return (
    <Tooltip label="Impersonate this user">
      <ActionIcon variant="subtle" color="gray" loading={busy} onClick={() => onEnter(user)} aria-label="Impersonate">
        <LogIn size={15} />
      </ActionIcon>
    </Tooltip>
  );
}
