import { ActionIcon, Tooltip } from "@mantine/core";
import { Eye, Monitor, Smartphone } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import type { PaneTab } from "./ComposerPreviewPane";
import classes from "./ComposerPaneControls.module.css";

export type PreviewDevice = "desktop" | "mobile";

function TrayButton({
  label,
  active,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip label={label} withArrow openDelay={400}>
      <ActionIcon
        variant="subtle"
        size="lg"
        radius="sm"
        className={classes.option}
        onClick={onClick}
        aria-label={label}
        aria-pressed={active}
      >
        {children}
      </ActionIcon>
    </Tooltip>
  );
}

/**
 * What the right pane is showing, and at what width.
 *
 * Lives in the composer's own title bar rather than above the pane: both are
 * chrome for the same surface, and a second control strip inside the pane ate
 * the height the preview needed.
 */
export function ComposerPaneControls({
  tab,
  onTab,
  device,
  onDevice,
}: {
  tab: PaneTab;
  onTab: (next: PaneTab) => void;
  device: PreviewDevice;
  onDevice: (next: PreviewDevice) => void;
}) {
  return (
    <>
      <div className={classes.tray}>
        <TrayButton label="Preview" active={tab === "preview"} onClick={() => onTab("preview")}>
          <Eye size={17} />
        </TrayButton>
        <TrayButton label="Schedule with Orbit" active={tab === "orbit"} onClick={() => onTab("orbit")}>
          <OrbitMark size={17} />
        </TrayButton>
      </div>

      {/* Only meaningful over the preview — the conversation has no device.
          A spacer holds the row's shape so the pane switch does not slide to
          the middle when the device icons go. */}
      {tab !== "preview" && <span />}
      {tab === "preview" && (
        <div className={classes.tray}>
          {([
            { id: "desktop" as const, Icon: Monitor, label: "Desktop" },
            { id: "mobile" as const, Icon: Smartphone, label: "Mobile" },
          ]).map(({ id, Icon, label }) => (
            <TrayButton key={id} label={label} active={device === id} onClick={() => onDevice(id)}>
              <Icon size={17} />
            </TrayButton>
          ))}
        </div>
      )}
    </>
  );
}
