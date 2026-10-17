import { Modal } from "@mantine/core";
import classes from "./overviewCards.module.css";

export function ScreenshotModal({
  src,
  view,
  opened,
  onClose,
}: {
  src: string;
  view: "mobile" | "desktop";
  opened: boolean;
  onClose: () => void;
}) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={view === "mobile" ? "Mobile preview" : "Desktop preview"}
      size={view === "mobile" ? "md" : "80rem"}
      centered
      radius="lg"
    >
      <div className={classes.modalShot} data-view={view}>
        <img src={src} alt={`Full screenshot of the page on ${view}`} className={classes.modalImg} />
      </div>
    </Modal>
  );
}
