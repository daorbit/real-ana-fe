import { Button, Center, Group, Loader, PasswordInput, Stack, Switch, Text, TextInput } from "@mantine/core";
import { Save, Send } from "lucide-react";
import { Field, Section } from "@/shared/ui/Page";
import { useOpsAlertForm } from "../../useOpsAlertForm";
import { AdminSection } from "../layout/AdminSection";

function tokenHint(mask: string | null, usesPlatformBot: boolean): string {
  if (mask) return `Saved: ${mask}. Leave empty to keep it.`;
  if (usesPlatformBot) return "Empty uses the Quantalog bot. Paste a token from @BotFather to send from your own bot.";
  return "Paste the token @BotFather gave you.";
}

export default function AlertsPanel() {
  const { data, draft, loading, saving, testing, dirty, set, submit, removeToken, test } = useOpsAlertForm();

  return (
    <AdminSection id="alerts">
      {loading || !data ? (
        <Center py="xl"><Loader size="sm" /></Center>
      ) : (
        <Stack gap="xl">
          <Section
            title="Telegram"
            description="Server errors, failed cron jobs and services that stop answering are posted to this chat. The same error is sent at most once every 10 minutes."
          >
            <Field label="Alerts" hint="When off, nothing is sent, even if environment variables are set.">
              <Switch
                checked={draft.enabled}
                onChange={(e) => set("enabled", e.currentTarget.checked)}
                label={draft.enabled ? "On" : "Off"}
              />
            </Field>
            <Field label="Chat id" hint="Message your bot, then open getUpdates for the bot and copy chat.id. Group ids start with a minus sign.">
              <TextInput
                value={draft.chatId}
                onChange={(e) => set("chatId", e.currentTarget.value)}
                placeholder="123456789"
                aria-label="Telegram chat id"
              />
            </Field>
            <Field label="Bot token" hint={tokenHint(data.botTokenMask, data.usesPlatformBot)} last>
              <Stack gap={6}>
                <PasswordInput
                  value={draft.botToken}
                  onChange={(e) => set("botToken", e.currentTarget.value)}
                  placeholder={data.botTokenMask ?? "123456789:AA…"}
                  aria-label="Telegram bot token"
                  autoComplete="off"
                />
                {data.botTokenMask && (
                  <Group justify="flex-end">
                    <Button variant="subtle" color="gray" size="xs" onClick={removeToken} loading={saving}>
                      Remove saved token
                    </Button>
                  </Group>
                )}
              </Stack>
            </Field>
          </Section>

          {!data.chatId && data.envConfigured && (
            <Text size="xs" c="dimmed">
              Nothing saved here yet, so alerts use OPS_ALERT_TELEGRAM_CHAT_ID from the server environment.
            </Text>
          )}

          <Group justify="flex-end">
            <Button variant="default" leftSection={<Send size={15} />} onClick={test} loading={testing} disabled={dirty}>
              Send test
            </Button>
            <Button leftSection={<Save size={15} />} onClick={submit} loading={saving} disabled={!dirty}>
              Save changes
            </Button>
          </Group>
        </Stack>
      )}
    </AdminSection>
  );
}
