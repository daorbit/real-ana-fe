import { useState } from "react";
import {
  Text, Group, Button, Card, ActionIcon, Alert, Code, CopyButton, Modal,
  TextInput, Stack, Center, ThemeIcon, SimpleGrid, Tooltip,
} from "@mantine/core";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  KeyRound, Plus, Trash2, Copy, Check, BookOpen,
  ShieldCheck, ArrowRight, AlertTriangle,
} from "lucide-react";
import {
  useGetApiKeysQuery, useCreateApiKeyMutation, useRevokeApiKeyMutation,
} from "../store";
import { AppShell } from "../components/AppShell";
import { PageHeader } from "../components/Page";
import { PageHelpButton } from "../components/PageHelpButton";
import { notify, errMessage, confirmDelete } from "../notify";
import { useWorkspace } from "../workspace";
import type { ApiKey } from "../types";

/* ------------------------------- API keys ------------------------------- */

function KeysTab() {
  const { t } = useTranslation();
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
        name: name || t("developers.defaultKeyName"),
      }).unwrap();
      setJustCreated(k);
      setName("");
      setModal(false);
      notify.success(t("developers.createdToast"));
    } catch (e2) {
      notify.error(errMessage(e2, t("developers.createError")));
    }
  };

  const revoke = (k: ApiKey) => {
    if (!active) return;
    confirmDelete({
      title: t("developers.revokeTitle", { name: k.name }),
      body: t("developers.revokeBody"),
      confirmLabel: t("developers.revokeConfirm"),
      onConfirm: async () => {
        try {
          await revokeKey({ workspaceId: active._id, keyId: k.id }).unwrap();
          notify.success(t("developers.revokedToast", { name: k.name }));
        } catch (err) {
          notify.error(errMessage(err, t("developers.revokeError")));
        }
      },
    });
  };

  return (
    <Stack gap="lg">
      <Modal opened={modal} onClose={() => setModal(false)} title={t("developers.createTitle")} centered radius="lg">
        <form onSubmit={create}>
          <Stack gap="md">
            <TextInput
              label={t("developers.keyName")}
              placeholder={t("developers.keyNamePlaceholder")}
              description={t("developers.keyNameDesc")}
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              data-autofocus
            />
            <Alert color="yellow" variant="light" p="xs" icon={<ShieldCheck size={14} />}>
              <Text size="xs">{t("developers.createWarning")}</Text>
            </Alert>
            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setModal(false)}>{t("common.cancel")}</Button>
              <Button type="submit" loading={creating}>{t("developers.createKey")}</Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* Secret reveal modal — the only time the raw key is ever shown */}
      <Modal
        opened={!!justCreated?.key}
        onClose={() => setJustCreated(null)}
        title={t("developers.newKeyTitle")}
        centered
        radius="lg"
        size="lg"
        closeOnClickOutside={false}
      >
        {justCreated?.key && (
          <Stack gap="md">
            <Alert color="yellow" variant="light" p="xs" icon={<AlertTriangle size={14} />}>
              <Text size="xs">{t("developers.newKeyWarning")}</Text>
            </Alert>

            <Card withBorder radius="md" padding="sm" bg="var(--surface-2)">
              <Code block style={{ background: "transparent" }}>{justCreated.key}</Code>
            </Card>

            <Group justify="flex-end" gap="sm">
              <Button variant="default" onClick={() => setJustCreated(null)}>{t("developers.done")}</Button>
              <CopyButton value={justCreated.key}>
                {({ copied, copy }) => (
                  <Button onClick={copy} leftSection={copied ? <Check size={15} /> : <Copy size={15} />}>
                    {copied ? t("developers.copied") : t("developers.copyKey")}
                  </Button>
                )}
              </CopyButton>
            </Group>
          </Stack>
        )}
      </Modal>

      <Group justify="space-between" align="center">
        <div>
          <Text fw={650}>{t("developers.keysTitle")}</Text>
          <Text size="sm" c="dimmed">{t("developers.keysDesc")}</Text>
        </div>
        <Button leftSection={<Plus size={16} />} onClick={() => setModal(true)}>{t("developers.createKey")}</Button>
      </Group>

      {keys.length === 0 ? (
        <Card withBorder radius="lg" padding="xl">
          <Center>
            <Stack align="center" gap={8}>
              <ThemeIcon variant="light" color="emerald" size={52} radius="xl"><KeyRound size={24} /></ThemeIcon>
              <Text fw={600} size="sm">{t("developers.emptyTitle")}</Text>
              <Text c="dimmed" size="xs" ta="center" maw={320}>
                {t("developers.emptyBody")}
              </Text>
              <Button size="xs" variant="light" mt={4} leftSection={<Plus size={14} />} onClick={() => setModal(true)}>{t("developers.emptyCta")}</Button>
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
                        {k.lastUsedAt
                          ? t("developers.lastUsed", { when: new Date(k.lastUsedAt).toLocaleString() })
                          : t("developers.neverUsed")}
                      </Text>
                    </div>
                  </Group>
                  <Tooltip label={t("developers.revoke")} withArrow>
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
  const { t } = useTranslation();
  return (
    <Card withBorder radius="lg" padding="lg" mb="lg" className="dev-hero">
      <Group justify="space-between" wrap="wrap" gap="md">
        <Group gap="sm" wrap="nowrap" style={{ flex: "1 1 240px", minWidth: 0 }}>
          <ThemeIcon variant="light" color="emerald" radius="md" size="lg">
            <BookOpen size={18} />
          </ThemeIcon>
          <div>
            <Text fw={650}>{t("developers.docsTitle")}</Text>
            <Text size="sm" c="dimmed">
              {t("developers.docsDesc")}
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
          {t("developers.docsCta")}
        </Button>
      </Group>
    </Card>
  );
}

export default function Developers() {
  const { t } = useTranslation();
  return (
    <AppShell>
      <PageHeader
        title={t("developers.title")}
        description={t("developers.description")}
        actions={<PageHelpButton />}
      />

      <DocsLink />
      <KeysTab />
    </AppShell>
  );
}
