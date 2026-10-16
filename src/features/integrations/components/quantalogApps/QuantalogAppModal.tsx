import { Badge, Button, Group, Text } from "@mantine/core";
import { ArrowRight, Power } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { confirmDelete } from "@/shared/lib/notify";
import { dateTime } from "@/shared/lib/format";
import { useToggleWorkspaceApp } from "../../hooks/useToggleWorkspaceApp";
import { appGuideUrl } from "../../lib/links";
import type { WorkspaceAppInfo } from "../../lib/quantalogApps";
import { BrandMark } from "../logos/BrandMarks";
import { IntegrationStudio } from "../studio/IntegrationStudio";
import { AsideBlock, StudioHero, StudioSection } from "../studio/StudioParts";
import { QuantalogAppFeatures } from "./QuantalogAppFeatures";
import classes from "./QuantalogApp.module.css";

interface Props {
  info: WorkspaceAppInfo;
  opened: boolean;
  onClose: () => void;
}

export function QuantalogAppModal({ info, opened, onClose }: Props) {
  const navigate = useNavigate();
  const app = useToggleWorkspaceApp(info.id);

  const open = () => {
    onClose();
    navigate(info.route);
  };

  const turnOff = () =>
    confirmDelete({
      title: `Turn off ${info.name}?`,
      body: `${info.navLabel} leaves the sidebar for everyone in this workspace. Your tracked competitors and their history are kept, so turning it back on picks up where you left off.`,
      confirmLabel: "Turn off",
      onConfirm: async () => {
        await app.toggle(false);
      },
    });

  const footer = (
    <Group justify="space-between" wrap="nowrap">
      {app.enabled && app.canManage ? (
        <Button type="button" variant="subtle" color="red" leftSection={<Power size={15} />} disabled={app.saving} onClick={turnOff}>
          Turn off
        </Button>
      ) : (
        <Button type="button" variant="default" onClick={onClose} disabled={app.saving}>
          Close
        </Button>
      )}
      {app.enabled ? (
        <Button type="button" rightSection={<ArrowRight size={15} />} onClick={open}>
          Open {info.navLabel}
        </Button>
      ) : (
        <Button
          type="button"
          leftSection={<Power size={15} />}
          loading={app.saving}
          disabled={!app.canManage}
          onClick={() => void app.toggle(true)}
        >
          Enable {info.navLabel}
        </Button>
      )}
    </Group>
  );

  return (
    <IntegrationStudio
      opened={opened}
      onClose={onClose}
      brand={info.tileId}
      title={info.name}
      subtitle="Official Quantalog app"
      badge={
        <Badge size="sm" variant="light" color={app.enabled ? "teal" : "gray"}>
          {app.enabled ? "On" : "Off"}
        </Badge>
      }
      docsUrl={appGuideUrl(info.tileId)}
      closeDisabled={app.saving}
      footer={footer}
      aside={
        <>
          <AsideBlock label="About">
            <Text size="sm">{info.description}</Text>
          </AsideBlock>
          <AsideBlock label="Access">
            <Text size="sm" c="dimmed">
              Workspace admins turn apps on and off. Once on, everyone in the workspace sees {info.navLabel} in the
              sidebar.
            </Text>
          </AsideBlock>
          {app.enabled && app.enabledAt && (
            <AsideBlock label="Turned on">
              <Text size="sm">{dateTime(app.enabledAt)}</Text>
            </AsideBlock>
          )}
        </>
      }
    >
      <StudioHero
        state={app.enabled ? "live" : "off"}
        pill={app.enabled ? "On" : "Off"}
        title={app.enabled ? `${info.name} is on` : `Turn on ${info.name}`}
        description={info.tagline}
      />

      <div className={classes.badge}>
        <BrandMark id={info.tileId} size={48} />
        <div className={classes.badgeText}>
          <Text fw={650}>{info.name}</Text>
          <Text size="sm" c="dimmed">
            {app.enabled
              ? `Open it any time from ${info.navLabel} in the sidebar.`
              : app.canManage
                ? `Enable it and ${info.navLabel} appears in the sidebar for everyone in this workspace.`
                : `Ask a workspace admin to enable it.`}
          </Text>
        </div>
      </div>

      <StudioSection title="What you get" description="Built into Quantalog, using the sites you already track.">
        <QuantalogAppFeatures info={info} />
      </StudioSection>
    </IntegrationStudio>
  );
}
