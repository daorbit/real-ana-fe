import { Button, Text, UnstyledButton } from "@mantine/core";
import { Check } from "lucide-react";
import { useSaveFormsAppMutation } from "@/app/store";
import { notify, notifyError } from "@/shared/lib/notify";
import { BrandMark } from "./logos/BrandMarks";
import type { FormsApp } from "../types";
import classes from "./EmailProviderPicker.module.css";

const MARK_SIZE = 28;

interface Props {
  workspaceId: string;
  apps: FormsApp[];
  onConnect: (appId: string) => void;
}

function providerDetail(app: FormsApp): string {
  const from = String(app.config.fromEmail ?? "");
  if (app.enabled) return from ? `Sending from ${from}` : "Sending your form emails";
  if (!app.verifiedAt) return from ? `${from} · not verified yet` : "Not verified yet";
  return from || "Saved";
}

export function EmailProviderPicker({ workspaceId, apps, onConnect }: Props) {
  const [save, saveState] = useSaveFormsAppMutation();
  const providers = apps.filter((app) => app.category === "email");
  const hasSender = providers.some((app) => app.enabled);

  const choose = async (app: FormsApp) => {
    if (app.enabled) return;
    try {
      await save({ workspaceId, appId: app.id, values: {}, enabled: true }).unwrap();
      notify.success(`Form emails now go out through ${app.name}.`);
    } catch (e) {
      notifyError(e, `Could not switch to ${app.name}.`);
    }
  };

  return (
    <div className={classes.picker}>
      <div className={classes.head}>
        <Text fw={600} size="sm">
          Send form emails with
        </Text>
        <Text size="xs" c="dimmed">
          {hasSender ? "Only the provider you choose sends this workspace's form emails." : "Choose a provider. No form emails are sent until you do."}
        </Text>
      </div>
      <div role="radiogroup" aria-label="Send form emails with">
        {providers.map((app) =>
          app.connected ? (
            <UnstyledButton
              key={app.id}
              role="radio"
              aria-checked={app.enabled}
              className={classes.row}
              data-selected={app.enabled || undefined}
              disabled={saveState.isLoading}
              onClick={() => void choose(app)}
            >
              <BrandMark id={app.id} size={MARK_SIZE} />
              <span className={classes.text}>
                <Text size="sm" fw={600} truncate>
                  {app.name}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  {providerDetail(app)}
                </Text>
              </span>
              {app.enabled && <Check size={18} className={classes.check} aria-hidden />}
            </UnstyledButton>
          ) : (
            <div key={app.id} className={classes.row}>
              <BrandMark id={app.id} size={MARK_SIZE} />
              <span className={classes.text}>
                <Text size="sm" fw={600} truncate>
                  {app.name}
                </Text>
                <Text size="xs" c="dimmed" truncate>
                  Not connected
                </Text>
              </span>
              <Button type="button" size="compact-sm" variant="default" onClick={() => onConnect(app.id)}>
                Connect
              </Button>
            </div>
          ),
        )}
      </div>
    </div>
  );
}
