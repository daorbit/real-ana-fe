import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { ActionIcon, Button, Modal, type ButtonProps } from "@mantine/core";
import { X, type LucideIcon } from "lucide-react";
import classes from "./SecureDialog.module.css";

const NO_OP = () => {};
const BLOCKING_OVERLAY = { backgroundOpacity: 0.5, blur: 10 };

export function SecureDialog({
  opened = true,
  onClose,
  icon: Icon,
  eyebrow,
  title,
  description,
  size = 420,
  closeOnClickOutside,
  contentKey,
  children,
}: {
  opened?: boolean;
  onClose?: () => void;
  icon?: LucideIcon;
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  size?: number;
  closeOnClickOutside?: boolean;
  contentKey?: string;
  children: ReactNode;
}) {
  const dismissible = Boolean(onClose);

  return (
    <Modal
      opened={opened}
      onClose={onClose ?? NO_OP}
      size={size}
      padding={0}
      withCloseButton={false}
      closeOnEscape={dismissible}
      closeOnClickOutside={closeOnClickOutside ?? dismissible}
      overlayProps={dismissible ? undefined : BLOCKING_OVERLAY}
    >
      <div className={classes.card}>
        {onClose && (
          <ActionIcon
            variant="transparent"
            size={32}
            radius="xl"
            onClick={onClose}
            aria-label="Close"
            className={classes.close}
          >
            <X size={16} />
          </ActionIcon>
        )}

        <div key={contentKey} className="verify-rise">
          <div className={classes.head}>
            {Icon && (
              <span className={classes.badge}>
                <Icon size={24} />
              </span>
            )}
            {eyebrow && <span className={classes.eyebrow}>{eyebrow}</span>}
            <h2 className={classes.title}>{title}</h2>
            {description && <p className={classes.description}>{description}</p>}
          </div>
          <div className={classes.body}>{children}</div>
        </div>
      </div>
    </Modal>
  );
}

export function SecureDialogButton(props: ButtonProps & ComponentPropsWithoutRef<"button">) {
  return <Button fullWidth className={classes.primary} {...props} />;
}

export function SecureDialogLinks({ children }: { children: ReactNode }) {
  return <div className={classes.links}>{children}</div>;
}

export function SecureDialogLink(props: ComponentPropsWithoutRef<"button">) {
  return <button type="button" className={classes.link} {...props} />;
}
