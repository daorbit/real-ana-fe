import { Button, Loader, Modal, Text } from "@mantine/core";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { GoogleMark } from "@/shared/ui/GoogleMark";
import classes from "./OAuthWaitingModal.module.css";

export function OAuthWaitingModal({
  opened,
  title = "Continue in the Google window",
  description = "Choose your Google account and allow access. This window updates automatically when you're done.",
  onFocus,
  onCancel,
}: {
  opened: boolean;
  title?: string;
  description?: string;
  onFocus: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onCancel}
      centered
      withCloseButton={false}
      radius="lg"
      size={420}
      overlayProps={{ backgroundOpacity: 0.6, blur: 6 }}
      classNames={{ body: classes.body }}
    >
      <div className={classes.mark}>
        <GoogleMark size={28} />
        <Loader size={60} className={classes.spinner} type="oval" />
      </div>

      <Text className={classes.title}>{title}</Text>
      <Text className={classes.text}>{description}</Text>

      <div className={classes.actions}>
        <Button variant="default" leftSection={<ExternalLink size={14} />} onClick={onFocus} fullWidth>
          Show Google window
        </Button>
        <Button variant="subtle" color="gray" onClick={onCancel} fullWidth>
          Cancel
        </Button>
      </div>

      <div className={classes.note}>
        <ShieldCheck size={13} />
        <span>You sign in on google.com — Quantalog never sees your password.</span>
      </div>
    </Modal>
  );
}
