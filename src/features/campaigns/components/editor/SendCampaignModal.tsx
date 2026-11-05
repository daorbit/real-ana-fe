import { useEffect, useState } from "react";
import { Button, Checkbox, Group, Modal, Skeleton, Stack, Text } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { notify, notifyError } from "@/shared/lib/notify";
import { useCheckCampaignAudienceMutation, useSendCampaignMutation } from "@/features/campaigns/api";

interface Props {
  workspaceId: string;
  campaignId: string | null;
  onClose: () => void;
}

export function SendCampaignModal({ workspaceId, campaignId, onClose }: Props) {
  const navigate = useNavigate();
  const [consent, setConsent] = useState(false);
  const [check, checkState] = useCheckCampaignAudienceMutation();
  const [send, sendState] = useSendCampaignMutation();
  const audience = checkState.data;

  useEffect(() => {
    setConsent(false);
    if (campaignId) void check({ workspaceId, id: campaignId });
  }, [campaignId, workspaceId, check]);

  const confirm = async () => {
    if (!campaignId) return;
    try {
      await send({ workspaceId, id: campaignId }).unwrap();
      notify.success("Your campaign is on its way.");
      onClose();
      navigate(`/app/campaigns/${campaignId}`);
    } catch (e) {
      notifyError(e, "The campaign could not be sent.");
    }
  };

  const overLimit = audience ? audience.usage.used + audience.total > audience.usage.limit : false;

  return (
    <Modal opened={Boolean(campaignId)} onClose={onClose} title="Send this campaign?" centered>
      <Stack gap="md">
        {checkState.isLoading || !audience ? (
          <Skeleton height={60} radius="md" />
        ) : (
          <Text size="sm">
            This goes to <b>{audience.total.toLocaleString()}</b> {audience.total === 1 ? "person" : "people"}
            {audience.suppressed ? `, leaving out ${audience.suppressed.toLocaleString()} who unsubscribed or bounced` : ""}. You have used{" "}
            {audience.usage.used.toLocaleString()} of {audience.usage.limit.toLocaleString()} campaign emails this month on the {audience.usage.plan} plan.
          </Text>
        )}
        {overLimit && (
          <Text size="sm" c="red">
            This would go over your monthly allowance. Reduce the audience or upgrade your plan.
          </Text>
        )}
        <Checkbox
          label="These people agreed to get emails from me."
          checked={consent}
          onChange={(e) => setConsent(e.currentTarget.checked)}
        />
        <Group justify="flex-end" gap="xs">
          <Button variant="default" onClick={onClose} disabled={sendState.isLoading}>
            Cancel
          </Button>
          <Button
            loading={sendState.isLoading}
            disabled={!consent || !audience?.total || overLimit}
            onClick={() => void confirm()}
          >
            Send campaign
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
