import { useEffect } from "react";
import { Badge, Button, Group, Text } from "@mantine/core";
import { ArrowRight, LockOpen, Power } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotes } from "@/features/notes";
import { confirmDelete } from "@/shared/lib/notify";
import { dateTime } from "@/shared/lib/format";
import { useToggleWorkspaceApp } from "../../hooks/useToggleWorkspaceApp";
import { useAppUnlock } from "../../hooks/useAppUnlock";
import { AppUnlockCheckout } from "./AppUnlockCheckout";
import { appGuideUrl } from "../../lib/links";
import type { WorkspaceAppInfo } from "../../lib/quantalogApps";
import { IntegrationStudio } from "../studio/IntegrationStudio";
import { AsideBlock, StudioHero } from "../studio/StudioParts";
import { QuantalogAppFeatures } from "./QuantalogAppFeatures";
import { QuantalogAppSettings, hasAppSettings } from "./QuantalogAppSettings";
import { useWorkspace } from "@/features/workspace/context";
import { SaveBarProvider, useUnsavedChanges } from "@/shared/ui/SaveBar";
import classes from "./QuantalogApp.module.css";

interface Props {
  info: WorkspaceAppInfo;
  opened: boolean;
  onClose: () => void;
}

export function QuantalogAppModal(props: Props) {
  return (
    <SaveBarProvider>
      <QuantalogAppStudio {...props} />
    </SaveBarProvider>
  );
}

function QuantalogAppStudio({ info, opened, onClose }: Props) {
  const navigate = useNavigate();
  const notes = useNotes();
  const { active } = useWorkspace();
  const unsaved = useUnsavedChanges();
  const app = useToggleWorkspaceApp(info.id);
  const unlock = useAppUnlock(info.id);
  const openCheckout = unlock.openCheckout;
  const available = app.enabled && !unlock.locked;
  const showSettings = hasAppSettings(info.id) && available && app.canManage && Boolean(active);
  const unlockLabel = unlock.priceLabel ? `Unlock for ${unlock.priceLabel}` : "Unlock";

  useEffect(() => {
    if (opened && app.enabled && unlock.locked) openCheckout();
  }, [opened, app.enabled, unlock.locked, openCheckout]);

  const requestClose = () => {
    if (!unsaved.dirtyCount) {
      onClose();
      return;
    }
    confirmDelete({
      title: "Discard unsaved changes?",
      body: "You have changes that haven't been saved. Closing now throws them away.",
      confirmLabel: "Discard",
      onConfirm: () => {
        unsaved.discardAll();
        onClose();
      },
    });
  };

  const open = () => {
    const go = () => {
      onClose();
      if (info.route) navigate(info.route);
      else notes.open();
    };
    if (!unsaved.dirtyCount) {
      go();
      return;
    }
    confirmDelete({
      title: "Discard unsaved changes?",
      body: "You have changes that haven't been saved. Opening the app now throws them away.",
      confirmLabel: "Discard",
      onConfirm: () => {
        unsaved.discardAll();
        go();
      },
    });
  };

  const turnOff = () =>
    confirmDelete({
      title: `Turn off ${info.name}?`,
      body: `${info.navLabel} disappears for everyone in this workspace. ${info.offNote}`,
      confirmLabel: "Turn off",
      onConfirm: async () => {
        unsaved.discardAll();
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
        <Button type="button" variant="default" onClick={requestClose} disabled={app.saving}>
          Close
        </Button>
      )}
      {showSettings && !info.route ? (
        <Button type="button" onClick={requestClose}>
          Done
        </Button>
      ) : unlock.locked ? (
        <Button
          type="button"
          leftSection={<LockOpen size={15} />}
          loading={unlock.buying}
          disabled={!app.canManage || unlock.price === null}
          onClick={unlock.openCheckout}
        >
          {unlockLabel}
        </Button>
      ) : app.enabled ? (
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
      onClose={requestClose}
      brand={info.tileId}
      title={info.name}
      subtitle="Official Quantalog app"
      badge={
        unlock.locked && unlock.priceLabel ? (
          <Badge size="sm" variant="light" color="emerald">
            {unlock.priceLabel} · one-time
          </Badge>
        ) : (
          <Badge size="sm" variant="light" color={app.enabled ? "teal" : "gray"}>
            {app.enabled ? "On" : "Off"}
          </Badge>
        )
      }
      docsUrl={appGuideUrl(info.tileId)}
      closeDisabled={app.saving}
      footer={footer}
      aside={
        <>
          <AsideBlock label="About">
            <Text size="sm">{info.description}</Text>
          </AsideBlock>
          {unlock.locked && (
            <AsideBlock label="Price">
              <Text size="sm">
                {unlock.priceLabel ?? "…"} once, for this workspace. No subscription, and it stays unlocked for good.
              </Text>
            </AsideBlock>
          )}
          <AsideBlock label="Access">
            <Text size="sm" c="dimmed">
              Workspace admins turn apps on and off. Once on, everyone in the workspace finds {info.navLabel}{" "}
              {info.location}.
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
        state={available ? "live" : "off"}
        pill={available ? "On" : unlock.locked ? "Locked" : "Off"}
        title={available ? `${info.name} is on` : unlock.locked ? `Unlock ${info.name}` : `Turn on ${info.name}`}
        description={info.tagline}
      />

      {showSettings && active ? (
        <QuantalogAppSettings app={info.id} workspaceId={active._id} />
      ) : (
        <section className={classes.overview}>
          <span className={classes.overviewLabel}>What you get</span>
          <QuantalogAppFeatures info={info} />
          <p className={classes.note}>
            {available
              ? `Open ${info.navLabel} any time ${info.location}.`
              : unlock.locked
                ? app.canManage
                  ? `A one-time payment${unlock.priceLabel ? ` of ${unlock.priceLabel}` : ""} unlocks it, and everyone in this workspace finds ${info.navLabel} ${info.location}.`
                  : "Ask a workspace admin to unlock it."
                : app.canManage
                  ? `Enable it and everyone in this workspace finds ${info.navLabel} ${info.location}.`
                  : "Ask a workspace admin to enable it."}
          </p>
        </section>
      )}

      {unlock.locked && unlock.price !== null && (
        <AppUnlockCheckout
          info={info}
          opened={unlock.checkoutOpen}
          price={unlock.price}
          currency={unlock.currency}
          busy={unlock.buying}
          canManage={app.canManage}
          onClose={unlock.closeCheckout}
          onConfirm={(request) => void unlock.buy(request)}
        />
      )}
    </IntegrationStudio>
  );
}
