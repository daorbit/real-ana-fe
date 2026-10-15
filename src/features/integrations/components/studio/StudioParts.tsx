import type { ReactNode } from "react";
import { Text } from "@mantine/core";
import { CircleCheck, CircleDashed, LockKeyhole } from "lucide-react";
import classes from "./StudioParts.module.css";

export function StudioSection({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className={classes.section}>
      <div className={classes.sectionHead}>
        <div>
          <Text fw={650} size="sm">
            {title}
          </Text>
          {description && (
            <Text size="xs" c="dimmed" mt={3}>
              {description}
            </Text>
          )}
        </div>
        {action}
      </div>
      <div className={classes.sectionBody}>{children}</div>
    </section>
  );
}

export function AsideBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={classes.block}>
      <div className={classes.label}>{label}</div>
      {children}
    </div>
  );
}

export function SetupChecklist({ items }: { items: { label: string; done: boolean }[] }) {
  return (
    <ul className={classes.checklist}>
      {items.map((item) => (
        <li key={item.label} className={classes.checkItem}>
          {item.done ? (
            <CircleCheck size={16} className={classes.checkDone} />
          ) : (
            <CircleDashed size={16} className={classes.checkOpen} />
          )}
          <Text size="sm" c={item.done ? undefined : "dimmed"}>
            {item.label}
          </Text>
        </li>
      ))}
    </ul>
  );
}

export function SecureNote({ children }: { children: ReactNode }) {
  return (
    <div className={classes.secure}>
      <LockKeyhole size={15} className={classes.secureIcon} />
      <Text size="xs" c="dimmed">
        {children}
      </Text>
    </div>
  );
}

export function StatusLine({ state, children }: { state: "live" | "saved" | "off"; children: ReactNode }) {
  return (
    <div className={classes.statusRow}>
      <span className={classes.dot} data-state={state} />
      <Text size="sm" c={state === "live" ? undefined : "dimmed"}>
        {children}
      </Text>
    </div>
  );
}

export const studioClasses = classes;
