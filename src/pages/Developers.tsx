import { useState } from "react";
import {
  Title, Text, Group, Button, Card, ActionIcon, Alert, Code, CopyButton, Modal,
  TextInput, Stack, Center, ThemeIcon, SimpleGrid, Tooltip,
} from "@mantine/core";
import { motion } from "framer-motion";
import {
  KeyRound, Plus, Trash2, Copy, Check, BookOpen,
  ShieldCheck, ArrowRight, AlertTriangle,
} from "lucide-react";
import {
  useGetApiKeysQuery, useCreateApiKeyMutation, useRevokeApiKeyMutation,
} from "../store";
import { AppShell } from "../components/AppShell";
import { notify, errMessage, confirmDelete } from "../notify";
import { useWorkspace } from "../workspace";
import type { ApiKey } from "../types";

/* ------------------------------- API keys ------------------------------- */

function KeysTab() {
  const { active } = useWorkspace();
  const [modal, setModal] = useState(false);
  const [name, setName] = useState("");
  const [justCreated, setJustCreated] = useState<ApiKey | null>(null);

  // Cached; the mutations below invalidate the ApiKey tag, so the list
  // refreshes itself after a create or a revoke.
  const { data: keys = [] } = useGetApiKeysQuery(active!._id, { skip: !active });
  const [createKey, { isLoading: creating }] = useCreateApiKeyMutation();
  const [revokeKey] = useRevokeApiKeyMutation();

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    try {
      const k = await createKey({
        workspaceId: active._id,
        name: name || "Default key",
      }).unwrap();
      setJustCreated(k);
      setName("");
      setModal(false);
      notify.success("API key created. Copy it now — it won't be shown again.");
    } catch (e2) {
      notify.error(errMessage(e2, "Could not create the API key."));
    }
  };

  const revoke = (k: ApiKey) => {
    if (!active) return;
    confirmDelete({
      title: `Revoke "${k.name}"?`,
      body: "Any integration still using this key will immediately start receiving 401 Unauthorized. This cannot be undone.",
      confirmLabel: "Revoke key",
      onConfirm: async () => {
        try {
          await revokeKey({ workspaceId: active._id, keyId: k.id }).unwrap();
          notify.success(`Key "${k.name}" revoked.`);
        } catch (err) {
          notify.error(errMessage(err, "Could not revoke the key."));
        }
      },
    });
  };

  return (
    <Stack gap="lg">
      <Modal opened={modal} onClose={() => setModal(false)} title="Create API key" centered radius="lg">
        <form onSubmit={create}>
          <Stack gap="md">
            <TextInput
              label="Key name"
              placeholder="e.g. Production backend"
              description="A label so you can tell your keys apart. Only you see it."
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              data-autofocus
            />
            <Alert color="yellow" variant="light" p="xs" icon={<ShieldCheck size={14} />}>
              <Text size="xs">The secret is shown once. Store it in an environment variable on your server.</Text>
            </Alert>
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setModal(false)}>Cancel</Button>
              <Button type="submit" loading={creating}>Create key</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Secret reveal modal — the only time the raw key is ever shown */}
      <Modal
        opened={!!justCreated?.key}
        onClose={() => setJustCreated(null)}
        title="Your new API key"
        centered
        radius="lg"
        size="lg"
        closeOnClickOutside={false}
      >
        {justCreated?.key && (
          <Stack gap="md">
            <Alert color="yellow" variant="light" p="xs" icon={<AlertTriangle size={14} />}>
              <Text size="xs">
                This is the only time we show this secret. We store a hash, so we cannot recover it later.
                Copy it into your server's environment variables now.
              </Text>
            </Alert>

            <Card withBorder radius="md" padding="sm" bg="var(--surface-2)">
              <Code block style={{ background: "transparent" }}>{justCreated.key}</Code>
            </Card>

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setJustCreated(null)}>Done</Button>
              <CopyButton value={justCreated.key}>
                {({ copied, copy }) => (
                  <Button onClick={copy} leftSection={copied ? <Check size={15} /> : <Copy size={15} />}>
                    {copied ? "Copied" : "Copy key"}
                  </Button>
                )}
              </CopyButton>
            </Group>
          </Stack>
        )}
      </Modal>

      <Group justify="space-between" align="center">
        <div>
          <Text fw={650}>Your API keys</Text>
          <Text size="sm" c="dimmed">Server-side secrets scoped to this workspace.</Text>
        </div>
        <Button leftSection={<Plus size={16} />} onClick={() => setModal(true)}>Create key</Button>
      </Group>

      {keys.length === 0 ? (
        <Card withBorder radius="lg" padding="xl">
          <Center>
            <Stack align="center" gap={8}>
              <ThemeIcon variant="light" color="emerald" size={52} radius="xl"><KeyRound size={24} /></ThemeIcon>
              <Text fw={600} size="sm">No API keys yet</Text>
              <Text c="dimmed" size="xs" ta="center" maw={320}>
                Create a key to start creating projects and sites for your users from your own backend.
              </Text>
              <Button size="xs" variant="light" mt={4} leftSection={<Plus size={14} />} onClick={() => setModal(true)}>Create your first key</Button>
            </Stack>
          </Center>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, md: 2 }}>
          {keys.map((k, i) => (
            <motion.div key={k.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card withBorder radius="lg" padding="lg">
                <Group justify="space-between" align="flex-start" mb="sm">
                  <Group gap="sm">
                    <ThemeIcon variant="light" color="emerald" radius="md" size="lg"><KeyRound size={17} /></ThemeIcon>
                    <div>
                      <Text fw={650} size="sm">{k.name}</Text>
                      <Text size="xs" c="dimmed">
                        {k.lastUsedAt ? `Last used ${new Date(k.lastUsedAt).toLocaleString()}` : "Never used"}
                      </Text>
                    </div>
                  </Group>
                  <Tooltip label="Revoke" withArrow>
                    <ActionIcon variant="subtle" color="red" onClick={() => revoke(k)}><Trash2 size={15} /></ActionIcon>
                  </Tooltip>
                </Group>
                <Code block>{k.prefix}••••••••••••••••••••</Code>
              </Card>
            </motion.div>
          ))}
        </SimpleGrid>
      )}
    </Stack>
  );
}

/* -------------------------------- Page ---------------------------------- */

// Full documentation lives on the marketing site now; the dashboard only manages
// keys and points developers there.
const DOCS_URL = "https://quantalog.daorbit.in/docs";

/** Slim banner linking out to the full docs, which moved to the landing site. */
function DocsLink() {
  return (
    <Card withBorder radius="lg" padding="lg" mb="lg" className="dev-hero">
      <Group justify="space-between" wrap="wrap" gap="md">
        <Group gap="sm" wrap="nowrap" style={{ flex: "1 1 240px", minWidth: 0 }}>
          <ThemeIcon variant="light" color="emerald" radius="md" size="lg">
            <BookOpen size={18} />
          </ThemeIcon>
          <div>
            <Text fw={650}>Documentation</Text>
            <Text size="sm" c="dimmed">
              Install guides, custom events, and the full Platform API reference.
            </Text>
          </div>
        </Group>
        <Button
          component="a"
          href={DOCS_URL}
          target="_blank"
          rel="noopener noreferrer"
          variant="light"
          rightSection={<ArrowRight size={15} />}
          style={{ flexShrink: 0 }}
        >
          Read the docs
        </Button>
      </Group>
    </Card>
  );
}

export default function Developers() {
  return (
    <AppShell>
      <div style={{ marginBottom: 24 }}>
        <Title order={1}>Developers</Title>
        <Text c="dimmed" size="sm" mt={6}>
          Manage your API keys and offer real-time analytics to your own users.
        </Text>
      </div>

      <DocsLink />
      <KeysTab />
    </AppShell>
  );
}
