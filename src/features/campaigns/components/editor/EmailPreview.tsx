import { useState } from "react";
import { Button, SegmentedControl, TextInput } from "@mantine/core";
import { Send } from "lucide-react";
import { useAuth } from "@/features/auth/context";
import { notify, notifyError } from "@/shared/lib/notify";
import { useTestCampaignMutation } from "@/features/campaigns/api";
import { useCampaignPreview } from "@/features/campaigns/hooks/useCampaignPreview";
import type { CampaignInput } from "@/features/campaigns/types";
import classes from "./Editor.module.css";

interface Props {
  workspaceId: string | undefined;
  campaignId: string | undefined;
  draft: CampaignInput;
  onSave: () => Promise<boolean>;
}

export function EmailPreview({ workspaceId, campaignId, draft, onSave }: Props) {
  const { user } = useAuth();
  const html = useCampaignPreview(workspaceId, draft);
  const [size, setSize] = useState("desktop");
  const [to, setTo] = useState(user?.email ?? "");
  const [test, testState] = useTestCampaignMutation();

  const sendTest = async () => {
    if (!workspaceId || !campaignId || !(await onSave())) return;
    try {
      await test({ workspaceId, id: campaignId, to: to.trim() }).unwrap();
      notify.success(`Test email sent to ${to.trim()}.`);
    } catch (e) {
      notifyError(e, "The test email could not be sent.");
    }
  };

  return (
    <>
      <div className={classes.previewBar}>
        <div className={classes.previewSubject}>
          Subject: <strong>{draft.subject || "No subject yet"}</strong>
        </div>
        <SegmentedControl
          size="xs"
          aria-label="Preview size"
          data={[{ value: "desktop", label: "Desktop" }, { value: "phone", label: "Phone" }]}
          value={size}
          onChange={setSize}
        />
      </div>
      <div className={classes.frameWrap}>
        <iframe className={classes.frame} data-size={size} title="Email preview" sandbox="" srcDoc={html} />
      </div>
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
    </>
  );
}
