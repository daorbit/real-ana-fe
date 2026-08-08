import {
  Stack, Group, Button, TextInput, Textarea, Text, Loader, Center, Box, Tabs,
  UnstyledButton,
} from "@mantine/core";
import { Send, FlaskConical, Eye, PencilLine, Check } from "lucide-react";
import type { EmailComposerState } from "@/features/admin/useEmailComposer";

/**
 * The message: what it says, and what it will look like.
 *
 * Writing and previewing stay tabs rather than side-by-side panes — this column
 * is already sharing the modal with the audience, and splitting it again would
 * leave the preview too narrow to judge anything by.
 */
export function MessagePane({ state }: { state: EmailComposerState }) {
  const {
    single, audience,
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
      {templates.length > 0 && (
        <div>
          <Text
            size="xs"
            fw={700}
            c="dimmed"
            mb={6}
            tt="uppercase"
            style={{ letterSpacing: "0.5px" }}
          >
            Start from
          </Text>

          {templateId === "invite" && audience !== "custom" && !single && (
            <Text size="xs" c="orange" mb={6}>
              This one introduces Quantalog to someone new — the recipients you
              picked already have accounts.
            </Text>
          )}

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
            minRows={9}
            autosize
            maxRows={16}
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
                  style={{ width: "100%", height: 460, border: 0, display: "block" }}
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

      <Group justify="flex-end" gap="xs" mt="xs">
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
          {sending
            ? "Sending…"
            : single
              ? "Send"
              : `Send to ${recipients.length} ${recipients.length === 1 ? "person" : "people"}`}
        </Button>
      </Group>
    </Stack>
  );
}
