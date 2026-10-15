import { useEffect, useMemo, useState } from "react";
import { Badge, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { FlaskConical, Link2, Mail, Send, ShieldCheck } from "lucide-react";
import { useDisconnectFormsAppMutation, useSaveFormsAppMutation, useTestFormsAppMutation } from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { notify, notifyError } from "@/shared/lib/notify";
import { dateTime } from "@/shared/lib/format";
import { AppFieldInput } from "./AppFieldInput";
import { IntegrationStudio } from "./studio/IntegrationStudio";
import { AsideBlock, SecureNote, SetupChecklist, StatusLine, StudioSection, studioClasses } from "./studio/StudioParts";
import { initialValues, isDirty, missingRequired, payloadValues, type FieldValues } from "../lib/appForm";
import type { FormsApp } from "../types";

interface Props {
  app: FormsApp | null;
  workspaceId: string;
  onClose: () => void;
}

function StatusBadge({ app }: { app: FormsApp }) {
  if (app.enabled) return <Badge size="sm" variant="light" color="teal">Connected</Badge>;
  if (app.connected) return <Badge size="sm" variant="light" color="orange">Switched off</Badge>;
  return <Badge size="sm" variant="light" color="gray">Not connected</Badge>;
}

function statusText(app: FormsApp): string {
  const email = app.category === "email";
  if (app.enabled) return email ? `Live. Notification emails send through ${app.name}.` : `Live. New responses are posted to ${app.name}.`;
  if (app.connected) return "Saved but switched off. Nothing is sent through it.";
  return `Not connected. ${app.name} is not sending anything yet.`;
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
            { label: "Turned on", done: app.enabled },
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
    </>
  );
}

export function AppConnectModal({ app, workspaceId, onClose }: Props) {
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
            ? `${app.name} connected. Notification emails will go out through it.`
            : `${app.name} connected. New responses will be posted there.`
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
        {app.connected && !app.enabled && (
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
          {app.enabled ? "Save changes" : app.connected ? "Save and turn on" : `Connect ${app.name}`}
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
      docsUrl={app.docsUrl}
      closeDisabled={busy}
      aside={<AppAside app={app} dirty={dirty} />}
      footer={footer}
    >
      <StatusLine state={app.enabled ? "live" : app.connected ? "saved" : "off"}>{statusText(app)}</StatusLine>

      <StudioSection
        title={isEmail ? "Account details" : "Channel"}
        description={isEmail ? "Copy these from your provider's SMTP settings." : `Where ${app.name} should post new responses.`}
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
