import { useEffect, useMemo, useState } from "react";
import { Anchor, Badge, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { FlaskConical, Link2, Mail, Send, ShieldCheck } from "lucide-react";
import { useDisconnectFormsAppMutation, useSaveFormsAppMutation, useTestFormsAppMutation } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { notify, notifyError } from "@/shared/lib/notify";
import { dateTime, timeAgo } from "@/shared/lib/format";
import { AppFieldInput } from "./AppFieldInput";
import { ChatMessagePreview } from "./chat/ChatMessagePreview";
import { IntegrationStudio } from "./studio/IntegrationStudio";
import {
  AsideBlock,
  SecureNote,
  SetupChecklist,
  StudioHero,
  StudioSection,
  studioClasses,
  type StudioStat,
  type StudioState,
} from "./studio/StudioParts";
import { initialValues, isDirty, missingRequired, payloadValues, type FieldValues } from "../lib/appForm";
import { appGuideUrl } from "../lib/links";
import type { FormsApp } from "../types";

interface Props {
  app: FormsApp | null;
  sendingAppName?: string;
  workspaceId: string;
  refreshing: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

function StatusBadge({ app }: { app: FormsApp }) {
  if (app.enabled) return <Badge size="sm" variant="light" color="teal">Connected</Badge>;
  if (app.connected && app.category === "email") return <Badge size="sm" variant="light" color="gray">Not sending</Badge>;
  if (app.connected) return <Badge size="sm" variant="light" color="orange">Switched off</Badge>;
  return <Badge size="sm" variant="light" color="gray">Not connected</Badge>;
}

function heroFor(app: FormsApp, sendingAppName?: string): { state: StudioState; title: string; description: string } {
  const email = app.category === "email";
  if (app.enabled) {
    return {
      state: "live",
      title: `${app.name} is live`,
      description: email
        ? `Every form notification email in this workspace is sent through ${app.name}.`
        : `Every new response is posted to ${app.name} for forms that notify you.`,
    };
  }
  if (app.connected && email) {
    return {
      state: "saved",
      title: `${app.name} is saved but not sending`,
      description: sendingAppName
        ? `${sendingAppName} is sending your form emails. Switch to ${app.name} to send through it instead.`
        : `No provider is sending form emails. Choose ${app.name} to start sending through it.`,
    };
  }
  if (app.connected) {
    return {
      state: "saved",
      title: `${app.name} is saved but switched off`,
      description: "Your details are kept. Turn it on to start sending through it.",
    };
  }
  return {
    state: "off",
    title: `Connect ${app.name}`,
    description: email
      ? `Send form emails from your own address, so replies reach you and your domain's reputation stays yours.`
      : `Get a message in ${app.name} the moment a new response comes in.`,
  };
}

function statsFor(app: FormsApp): StudioStat[] | undefined {
  if (!app.connected) return undefined;
  return [
    app.category === "email"
      ? { label: "Status", value: app.enabled ? "Sending" : "Not sending", tone: app.enabled ? "ok" : undefined }
      : { label: "Status", value: app.enabled ? "On" : "Off", tone: app.enabled ? "ok" : "warn" },
    { label: "Last verified", value: app.verifiedAt ? timeAgo(app.verifiedAt) : "Never", tone: app.verifiedAt ? undefined : "warn" },
    { label: "Last used", value: app.lastUsedAt ? timeAgo(app.lastUsedAt) : "Not yet" },
  ];
}

function AppAside({ app, dirty }: { app: FormsApp; dirty: boolean }) {
  return (
    <>
      <AsideBlock label="About">
        <Text size="sm">{app.description}</Text>
      </AsideBlock>
      <AsideBlock label="Setup">
        <SetupChecklist
          items={[
            { label: "Details saved", done: app.connected },
            { label: `Verified with ${app.name}`, done: Boolean(app.verifiedAt) && !dirty },
            { label: app.category === "email" ? "Chosen for sending" : "Turned on", done: app.enabled },
          ]}
        />
        {app.verifiedAt && !dirty && (
          <Text size="xs" c="dimmed" mt="sm">
            Last verified {dateTime(app.verifiedAt)}
          </Text>
        )}
      </AsideBlock>
      <AsideBlock label="Security">
        <SecureNote>
          Keys and passwords are encrypted on the server and never shown again. Leave a saved secret blank to keep it.
        </SecureNote>
      </AsideBlock>
      {app.docsUrl && app.docsUrl !== appGuideUrl(app.id) && (
        <AsideBlock label={`${app.name} help`}>
          <Anchor href={app.docsUrl} target="_blank" rel="noreferrer" size="sm">
            Where to find these in {app.name}
          </Anchor>
        </AsideBlock>
      )}
    </>
  );
}

function primaryLabel(app: FormsApp): string {
  if (app.enabled) return "Save changes";
  if (app.category === "email") return app.connected ? `Send with ${app.name}` : `Connect and send with ${app.name}`;
  return app.connected ? "Save and turn on" : `Connect ${app.name}`;
}

export function AppConnectModal({ app, sendingAppName, workspaceId, refreshing, onClose, onRefresh }: Props) {
  const { user } = useAuth();
  const [values, setValues] = useState<FieldValues>({});
  const [testTo, setTestTo] = useState("");
  const [save, saveState] = useSaveFormsAppMutation();
  const [test, testState] = useTestFormsAppMutation();
  const [disconnect, disconnectState] = useDisconnectFormsAppMutation();
  const appId = app?.id;

  useEffect(() => {
    if (app) setValues(initialValues(app));
  }, [app]);

  useEffect(() => {
    if (appId) setTestTo(user?.email ?? "");
  }, [appId, user?.email]);

  const dirty = useMemo(() => (app ? isDirty(app, values) : false), [app, values]);
  const busy = saveState.isLoading || testState.isLoading || disconnectState.isLoading;

  if (!app) return null;
  const isEmail = app.category === "email";

  const handleSave = async (enable: boolean) => {
    const missing = missingRequired(app, values);
    if (missing) {
      notify.error(`${missing.label} is required.`);
      return;
    }
    try {
      await save({ workspaceId, appId: app.id, values: payloadValues(app, values), enabled: enable }).unwrap();
      notify.success(
        enable
          ? isEmail
            ? `Form emails now go out through ${app.name}.`
            : `${app.name} connected. New responses will be posted there.`
          : isEmail
            ? `${app.name} saved. Choose it under Email delivery when you want to send through it.`
            : `${app.name} saved. Turn it on when you are ready.`,
      );
    } catch (e) {
      notifyError(e, "Could not save the connection.");
    }
  };

  const handleTest = async (withEmail: boolean) => {
    try {
      const result = await test({ workspaceId, appId: app.id, to: withEmail ? testTo.trim() : undefined }).unwrap();
      if (result.ok) notify.success(result.message || "Test succeeded.");
      else notify.error(result.message || "The test failed.");
    } catch (e) {
      notifyError(e, "The test could not run.");
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect({ workspaceId, appId: app.id }).unwrap();
      notify.info(`${app.name} disconnected.`);
      onClose();
    } catch (e) {
      notifyError(e, "Could not disconnect.");
    }
  };

  const footer = (
    <Group justify="space-between" wrap="nowrap">
      {app.connected ? (
        <Button type="button" variant="subtle" color="red" loading={disconnectState.isLoading} disabled={busy} onClick={handleDisconnect}>
          Disconnect
        </Button>
      ) : (
        <Button type="button" variant="default" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
      )}
      <Group gap="xs" wrap="nowrap">
        {(app.connected || isEmail) && !app.enabled && (
          <Button type="button" variant="default" disabled={busy} onClick={() => handleSave(false)}>
            Save
          </Button>
        )}
        <Button
          type="button"
          leftSection={<Link2 size={16} />}
          loading={saveState.isLoading}
          disabled={busy || (app.enabled && !dirty)}
          onClick={() => handleSave(true)}
        >
          {primaryLabel(app)}
        </Button>
      </Group>
    </Group>
  );

  return (
    <IntegrationStudio
      opened
      onClose={onClose}
      brand={app.id}
      title={app.name}
      subtitle={isEmail ? "Email delivery for form notifications" : "Chat alerts for new responses"}
      badge={<StatusBadge app={app} />}
      docsUrl={appGuideUrl(app.id) ?? app.docsUrl}
      closeDisabled={busy}
      aside={<AppAside app={app} dirty={dirty} />}
      footer={footer}
      onRefresh={app.connected ? onRefresh : undefined}
      refreshing={refreshing}
      refreshDisabled={busy || dirty}
    >
      <StudioHero {...heroFor(app, sendingAppName)} stats={statsFor(app)} />

      <StudioSection
        title={isEmail ? "Account details" : "Channel"}
        description={isEmail ? "Copy these from your email provider's account." : `Where ${app.name} should post new responses.`}
      >
        <Stack gap="md">
          {app.fields.map((field) => (
            <AppFieldInput
              key={field.key}
              field={field}
              value={values[field.key] ?? ""}
              savedSecret={field.secret ? app.secrets[field.key] : undefined}
              onChange={(value) => setValues((prev) => ({ ...prev, [field.key]: value }))}
            />
          ))}
        </Stack>
      </StudioSection>

      {!isEmail && (
        <StudioSection
          title="Message preview"
          description={`What ${app.name} shows for each new response. The form's answers are listed under the title.`}
        >
          <ChatMessagePreview appId={app.id} appName={app.name} />
        </StudioSection>
      )}

      {app.testable && app.connected && (
        <StudioSection
          title="Test the connection"
          description={dirty ? "Save your changes before testing." : isEmail ? "Check the login, or send yourself a real email." : "Post a sample message to the channel."}
        >
          <Stack gap="md">
            <Group gap="sm" wrap="nowrap">
              <Button
                type="button"
                variant="default"
                leftSection={isEmail ? <ShieldCheck size={15} /> : <Send size={15} />}
                loading={testState.isLoading && testState.originalArgs?.to === undefined}
                disabled={dirty || busy}
                onClick={() => handleTest(false)}
              >
                {isEmail ? "Verify credentials" : "Send test message"}
              </Button>
              {isEmail && (
                <Text size="xs" c="dimmed">
                  Checks the login without sending anything.
                </Text>
              )}
            </Group>

            {isEmail && (
              <Group align="flex-end" gap="sm" wrap="nowrap">
                <TextInput
                  className={studioClasses.grow}
                  label="Send a real test email to"
                  placeholder="you@example.com"
                  type="email"
                  leftSection={<Mail size={15} />}
                  value={testTo}
                  onChange={(e) => setTestTo(e.currentTarget.value)}
                />
                <Button
                  type="button"
                  variant="default"
                  leftSection={<FlaskConical size={15} />}
                  loading={testState.isLoading && testState.originalArgs?.to !== undefined}
                  disabled={!testTo.trim() || dirty || busy}
                  onClick={() => handleTest(true)}
                >
                  Send test
                </Button>
              </Group>
            )}
          </Stack>
        </StudioSection>
      )}
    </IntegrationStudio>
  );
}
