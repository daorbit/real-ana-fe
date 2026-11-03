import { useEffect } from "react";
import { Button } from "@mantine/core";
import { ArrowRight, BookOpen, LockOpen, Power } from "lucide-react";
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
import { QuantalogAppFeatures } from "./QuantalogAppFeatures";
import { StudioPageHero } from "../studio/StudioPageHero";
import { StudioFacts, type StudioFact } from "../studio/StudioFacts";
import { AppTurnOffRow } from "./AppTurnOffRow";
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

  const opensElsewhere = Boolean(info.route) || !hasAppSettings(info.id);

  const heroActions = (
    <>
      {unlock.locked ? (
        <Button
          type="button"
          radius="xl"
          leftSection={<LockOpen size={15} />}
          loading={unlock.buying}
          disabled={!app.canManage || unlock.price === null}
          onClick={unlock.openCheckout}
        >
          {unlockLabel}
        </Button>
      ) : app.enabled ? (
        opensElsewhere && (
          <Button type="button" radius="xl" rightSection={<ArrowRight size={15} />} onClick={open}>
            Open {info.navLabel}
          </Button>
        )
      ) : (
        <Button
          type="button"
          radius="xl"
          leftSection={<Power size={15} />}
          loading={app.saving}
          disabled={!app.canManage}
          onClick={() => void app.toggle(true)}
        >
          Turn on
        </Button>
      )}
      <Button
        component="a"
        href={appGuideUrl(info.tileId)}
        target="_blank"
        rel="noreferrer"
        radius="xl"
        variant="default"
        leftSection={<BookOpen size={15} />}
      >
        Setup guide
      </Button>
    </>
  );

  const facts: StudioFact[] = [
    unlock.locked
      ? { label: "Status", value: "Locked", note: unlock.priceLabel ? `${unlock.priceLabel} once` : "One-time unlock" }
      : available
        ? { label: "Status", value: "On", tone: "on", note: app.enabledAt ? `Since ${dateTime(app.enabledAt)}` : "For everyone here" }
        : { label: "Status", value: "Off", note: "Not turned on" },
    { label: "Find it", value: info.navLabel, note: info.location },
    { label: "Access", value: "Admins", note: "turn it on and off" },
    { label: "Made by", value: "Quantalog", note: "Official app" },
  ];

  const offHint = unlock.locked
    ? app.canManage
      ? `A one-time payment${unlock.priceLabel ? ` of ${unlock.priceLabel}` : ""} unlocks it, and everyone in this workspace finds ${info.navLabel} ${info.location}.`
      : "Ask a workspace admin to unlock it."
    : app.canManage
      ? `Turn it on and everyone in this workspace finds ${info.navLabel} ${info.location}.`
      : "Ask a workspace admin to turn it on.";

  return (
    <IntegrationStudio
      customHero
      opened={opened}
      onClose={requestClose}
      brand={info.tileId}
      title={info.name}
      closeDisabled={app.saving}
    >
      <StudioPageHero brand={info.tileId} name={info.name} tagline={info.tagline} actions={heroActions} />
      <StudioFacts facts={facts} />

      <section className={classes.overview}>
        <p className={classes.description}>{info.description}</p>
        <QuantalogAppFeatures info={info} />
        {!available && <p className={classes.note}>{offHint}</p>}
      </section>

      {showSettings && active && <QuantalogAppSettings app={info.id} workspaceId={active._id} />}

      {app.enabled && app.canManage && (
        <AppTurnOffRow name={info.name} note={info.offNote} disabled={app.saving} onTurnOff={turnOff} />
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
