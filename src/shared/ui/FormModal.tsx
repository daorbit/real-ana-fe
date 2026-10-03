import { Modal } from "@mantine/core";
import classes from "@/shared/ui/FormModal.module.css";

export function FormModal({
  opened,
  onClose,
  title,
  url,
}: {
  opened: boolean;
  onClose: () => void;
  title: string;
  url: string;
}) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} size="lg" radius="md" zIndex={500} centered>
      <iframe src={url} title={title} className={classes.frame} />
    </Modal>
  );
}
