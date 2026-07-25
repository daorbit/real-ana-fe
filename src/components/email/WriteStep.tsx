import {
  Stack, Group, Button, TextInput, Textarea, Text, Loader, Center, Box, Tabs,
  UnstyledButton,
} from "@mantine/core";
import {
  Send, FlaskConical, ArrowLeft, Eye, PencilLine, Check,
} from "lucide-react";
import type { AdminUser } from "../../types";
import type { EmailComposerState } from "../../hooks/useEmailComposer";
import { RecipientSummary } from "./RecipientSummary";

/**
 * Step two: the message itself.
 *
 * Writing and previewing are tabs rather than side-by-side panes — at modal
 * width, two columns leaves neither wide enough to judge, and the preview is
 * something you check before sending rather than watch as you type.
 */
export function WriteStep({
  state,
  user,
}: {
  state: EmailComposerState;
  user?: AdminUser | null;
}) {
  const {
    single, setStep,
    templates, applyTemplate, templateId,
    subject, setSubject,
    body, setBody,
    tab, setTab,
    preview, previewing,
    recipients,
    busy, sending, testing, canSend,
    send, test,
  } = state;

  return (
    <Stack gap="md">
      <RecipientSummary state={state} user={user} />

      {templates.length > 0 && (
        <div>
          <Text size="xs" fw={600} c="dimmed" mb={6} tt="uppercase">
            Start from
          </Text>
          <Group gap={6}>
            {templates.map((t) => {
              const active = templateId === t.id;
              return (
                <UnstyledButton
                  key={t.id}
                  disabled={busy}
                  onClick={() => applyTemplate(t)}
                  title={t.hint}
                  style={{
                    // Selection reads as border plus fill, matching how the
                    // audience step marks its chosen option.
                    border: `1px solid var(${active ? "--mantine-color-emerald-6" : "--mantine-color-default-border"})`,
                    background: active ? "var(--mantine-color-emerald-light)" : undefined,
                    borderRadius: 8,
                    padding: "6px 11px",
                  }}
                >
                  <Group gap={5} wrap="nowrap">
                    {active && <Check size={12} />}
                    <Text size="xs" fw={active ? 600 : 500}>{t.label}</Text>
                  </Group>
                </UnstyledButton>
              );
            })}
          </Group>
        </div>
      )}

      <TextInput
        label="Subject"
        placeholder="Your Quantalog site isn't reporting yet"
        value={subject}
        onChange={(e) => setSubject(e.currentTarget.value)}
        disabled={busy}
      />

      <Tabs
        value={tab}
        onChange={(v) => setTab((v as "write" | "preview") ?? "write")}
        variant="outline"
        radius="md"
      >
        <Tabs.List>
          <Tabs.Tab value="write" leftSection={<PencilLine size={14} />}>
            Message
          </Tabs.Tab>
          <Tabs.Tab value="preview" leftSection={<Eye size={14} />} disabled={!body.trim()}>
            Preview
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="write" pt="sm">
          <Textarea
            description="{{greeting}} becomes “Hi Alex”, or just “Hello” when no name is known. {{name}} and {{email}} are also available."
            placeholder="{{greeting}}, …"
            value={body}
            onChange={(e) => setBody(e.currentTarget.value)}
            minRows={8}
            autosize
            maxRows={14}
            disabled={busy}
          />
        </Tabs.Panel>

        <Tabs.Panel value="preview" pt="sm">
          {/* Rendered server-side by the same code that builds the real message,
              so this is the mail itself rather than an impression of it. */}
          {previewing ? (
            <Center py="xl"><Loader size="sm" /></Center>
          ) : preview ? (
            <Stack gap={6}>
              <Text size="xs" c="dimmed">
                {preview.sampleName
                  ? `Shown as ${preview.sampleName} would receive it.`
                  : "Shown as a recipient with no name on file would receive it."}
              </Text>
              <Box
                style={{
                  border: "1px solid var(--mantine-color-default-border)",
                  borderRadius: 10,
                  overflow: "hidden",
                }}
              >
                <iframe
                  title="Email preview"
                  srcDoc={preview.html}
                  sandbox=""
                  style={{ width: "100%", height: 420, border: 0, display: "block" }}
                />
              </Box>
            </Stack>
          ) : (
            <Center py="xl">
              <Text size="sm" c="dimmed">Could not render a preview.</Text>
            </Center>
          )}
        </Tabs.Panel>
      </Tabs>

      {recipients.length > 20 && (
        <Text size="xs" c="dimmed">
          Sent one at a time — {recipients.length} messages take about{" "}
          {Math.ceil(recipients.length * 0.5)}s. Keep this window open.
        </Text>
      )}

      <Group justify="space-between" mt="xs">
        {single ? (
          <div />
        ) : (
          <Button
            variant="subtle"
            color="gray"
            leftSection={<ArrowLeft size={15} />}
            disabled={busy}
            onClick={() => setStep("audience")}
          >
            Back
          </Button>
        )}
        <Group gap="xs">
          <Button
            variant="default"
            radius="md"
            leftSection={testing ? <Loader size={13} /> : <FlaskConical size={15} />}
            disabled={!subject.trim() || !body.trim() || busy}
            onClick={test}
          >
            Test to me
          </Button>
          <Button
            color="emerald"
            radius="md"
            leftSection={sending ? <Loader size={13} color="white" /> : <Send size={15} />}
            disabled={!canSend || busy}
            onClick={send}
          >
            {sending ? "Sending…" : single ? "Send" : `Send to ${recipients.length}`}
          </Button>
        </Group>
      </Group>
    </Stack>
  );
}
