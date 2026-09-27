import { useEffect, useState, type ReactNode } from "react";
import { ActionIcon, Drawer, ScrollArea } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { X } from "lucide-react";
import styles from "./PanelDrawer.module.css";

export function PanelDrawer({
  opened,
  onClose,
  header,
  footer,
  bare = false,
  children,
  ariaLabel,
  size = 480,
}: {
  opened: boolean;
  onClose: () => void;
  header?: ReactNode;
  footer?: ReactNode;
  bare?: boolean;
  children: ReactNode;
  ariaLabel: string;
  size?: number;
}) {
  const mobile = useMediaQuery("(max-width: 48em)") ?? false;
  const [panelRoot, setPanelRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPanelRoot(document.getElementById("panel-overlay-root"));
  }, []);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={size}
      padding={0}
      radius={0}
      withCloseButton={false}
      portalProps={panelRoot ? { target: panelRoot } : undefined}
      withinPortal={Boolean(panelRoot)}
      classNames={
        panelRoot
          ? { root: styles.root, overlay: styles.overlay, inner: styles.inner, content: styles.content }
          : { content: styles.plainContent }
      }
      overlayProps={panelRoot ? { blur: 2, backgroundOpacity: 0 } : { backgroundOpacity: 0.35, blur: 2 }}
      transitionProps={
        mobile
          ? { duration: 280, transition: "slide-up", timingFunction: "cubic-bezier(0.32, 0.72, 0, 1)" }
          : { duration: 180, transition: "slide-left" }
      }
      aria-label={ariaLabel}
    >
      {bare ? (
        <div className={styles.body}>{children}</div>
      ) : (
        <div className={styles.body}>
          <header className={styles.header}>
            <div className={styles.headerMain}>{header}</div>
            <ActionIcon variant="subtle" color="gray" onClick={onClose} aria-label="Close">
              <X size={17} />
            </ActionIcon>
          </header>
          <ScrollArea className={styles.scroll} type="hover" scrollbarSize={8}>
            <div className={styles.padded}>{children}</div>
          </ScrollArea>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </div>
      )}
    </Drawer>
  );
}
