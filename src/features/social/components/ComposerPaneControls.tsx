import { ActionIcon, Group, Tooltip } from "@mantine/core";
import { Eye, Monitor, Smartphone } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import type { PaneTab } from "./ComposerPreviewPane";

export type PreviewDevice = "desktop" | "mobile";

/** The tray both icon pairs sit in, so the two read as one control family. */
const TRAY = {
  background: "var(--mantine-color-default)",
  borderRadius: "var(--mantine-radius-md)",
};

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
      <Group gap={4} p={4} wrap="nowrap" style={TRAY}>
        <Tooltip label="Preview" withArrow openDelay={400}>
          <ActionIcon
            variant={tab === "preview" ? "white" : "subtle"}
            color={tab === "preview" ? "dark" : "gray"}
            size="lg"
            radius="sm"
            onClick={() => onTab("preview")}
            aria-label="Preview"
            aria-pressed={tab === "preview"}
          >
            <Eye size={17} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Schedule with Orbit" withArrow openDelay={400}>
          <ActionIcon
            variant={tab === "orbit" ? "white" : "subtle"}
            color={tab === "orbit" ? "dark" : "gray"}
            size="lg"
            radius="sm"
            onClick={() => onTab("orbit")}
            aria-label="Schedule with Orbit"
            aria-pressed={tab === "orbit"}
          >
            <OrbitMark size={17} />
          </ActionIcon>
        </Tooltip>
      </Group>

      {/* Only meaningful over the preview — the conversation has no device.
          A spacer holds the row's shape so the pane switch does not slide to
          the middle when the device icons go. */}
      {tab !== "preview" && <span />}
      {tab === "preview" && (
        <Group
          gap={4}
          p={4}
          wrap="nowrap"
          style={TRAY}
        >
          {([
            { id: "desktop" as const, Icon: Monitor, label: "Desktop" },
            { id: "mobile" as const, Icon: Smartphone, label: "Mobile" },
          ]).map(({ id, Icon, label }) => (
            <Tooltip key={id} label={label} withArrow openDelay={400}>
              <ActionIcon
                variant={device === id ? "white" : "subtle"}
                color={device === id ? "dark" : "gray"}
                size="lg"
                radius="sm"
                onClick={() => onDevice(id)}
                aria-label={label}
                aria-pressed={device === id}
              >
                <Icon size={17} />
              </ActionIcon>
            </Tooltip>
          ))}
        </Group>
      )}
    </>
  );
}
