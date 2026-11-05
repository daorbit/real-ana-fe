import { useState } from "react";
import { Anchor, Button, Text, TextInput } from "@mantine/core";
import { Link } from "react-router-dom";
import { Send } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { notify, notifyError } from "@/shared/lib/notify";
import { useTestCampaignMutation } from "@/features/campaigns/api";
import { useCampaignPreview } from "@/features/campaigns/hooks/useCampaignPreview";
import type { CampaignInput, CampaignSources } from "@/features/campaigns/types";
import classes from "../Campaigns.module.css";

interface Props {
  workspaceId: string | undefined;
  draft: CampaignInput;
  sources: CampaignSources | undefined;
  onSave: () => Promise<string | null>;
}

function DeliveryNote({ delivery }: { delivery: CampaignSources["delivery"] | undefined }) {
  if (!delivery) return null;
  if (!delivery.connected) {
    return (
      <Text size="xs" c="dimmed" mt="sm">
        No email provider is active.{" "}
        <Anchor component={Link} to="/app/apps" size="xs">
          Activate one in Apps
        </Anchor>{" "}
        before sending.
      </Text>
    );
  }
  return (
    <Text size="xs" c="dimmed" mt="sm">
      Sends through {delivery.providerName}
      {delivery.fromEmail ? ` from ${delivery.fromEmail}` : ""}.
    </Text>
  );
}

export function EmailPreview({ workspaceId, draft, sources, onSave }: Props) {
  const { user } = useAuth();
  const html = useCampaignPreview(workspaceId, draft);
  const [to, setTo] = useState(user?.email ?? "");
  const [test, testState] = useTestCampaignMutation();

  const sendTest = async () => {
    if (!workspaceId) return;
    const id = await onSave();
    if (!id) return;
    try {
      await test({ workspaceId, id, to: to.trim() }).unwrap();
      notify.success(`Test email sent to ${to.trim()}.`);
    } catch (e) {
      notifyError(e, "The test email could not be sent.");
    }
  };

  return (
    <>
      <div className={classes.subjectLine}>
        Subject: <strong>{draft.subject || "No subject yet"}</strong>
      </div>
      <iframe className={classes.previewFrame} title="Email preview" sandbox="" srcDoc={html} />
      <div className={classes.testRow}>
        <TextInput
          className={classes.grow}
          label="Send a test to"
          type="email"
          value={to}
          onChange={(e) => setTo(e.currentTarget.value)}
        />
        <Button variant="default" leftSection={<Send size={14} />} loading={testState.isLoading} disabled={!to.trim()} onClick={() => void sendTest()}>
          Send test
        </Button>
      </div>
      <DeliveryNote delivery={sources?.delivery} />
    </>
  );
}
