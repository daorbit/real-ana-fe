import { useEffect, useRef } from "react";
import { ActionIcon, Modal } from "@mantine/core";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { DEMO_CALL_URL } from "@/shared/lib/docsSlugs";
import classes from "./DemoCallModal.module.css";

function DemoCallFrame() {
  const ref = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.data?.type !== "da-forms:height") return;
      if (!ref.current || e.source !== ref.current.contentWindow) return;
      ref.current.style.height = `${e.data.height}px`;
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return <iframe ref={ref} src={DEMO_CALL_URL} title="Book a demo call" scrolling="no" className={classes.frame} />;
}

export function DemoCallModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const { t } = useTranslation();

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      padding={0}
      radius="lg"
      size="auto"
      zIndex={500}
      classNames={{ inner: classes.inner, content: classes.content, body: classes.body }}
      transitionProps={{ transition: "fade", duration: 150 }}
    >
      <ActionIcon
        variant="default"
        radius="xl"
        size={36}
        className={classes.close}
        onClick={onClose}
        aria-label={t("common.close", "Close")}
      >
        <X size={16} />
      </ActionIcon>
      <div className={classes.scroll}>
        <DemoCallFrame />
      </div>
    </Modal>
  );
}
