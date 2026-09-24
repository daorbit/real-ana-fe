import { useMemo, useState } from "react";
import { Box, Button, Skeleton, Stack, Text, TextInput } from "@mantine/core";
import { KeyRound, Plus, Search, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import type { ApiKey } from "@/shared/types";
import { useApiKeys } from "../../hooks/useApiKeys";
import { ApiKeysTable } from "./ApiKeysTable";
import { CreateKeyModal } from "./CreateKeyModal";
import { RenameKeyModal } from "./RenameKeyModal";
import { KeyStats } from "./KeyStats";
import { PanelHeader } from "./PanelHeader";
import classes from "./Developers.module.css";

export function ApiKeysPanel({ workspaceId, workspaceName }: { workspaceId: string; workspaceName: string }) {
  const { t } = useTranslation();
  const {
    keys, isLoading, loadFailed, retrying, retry, creating, renaming, create, rename, revoke,
  } = useApiKeys(workspaceId);
  const [creatingOpen, setCreatingOpen] = useState(false);
  const [renamingKey, setRenamingKey] = useState<ApiKey | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return keys;
    return keys.filter((k) => k.name.toLowerCase().includes(q) || k.prefix.toLowerCase().includes(q));
  }, [keys, query]);

  const openCreate = () => setCreatingOpen(true);

  return (
    <Box className={classes.panel}>
      <PanelHeader
        icon={KeyRound}
        title={t("developers.keysTitle")}
        description={t("developers.keysIntro", { workspace: workspaceName })}
        action={
          <Button leftSection={<Plus size={16} />} onClick={openCreate}>
            {t("developers.createSecretKey")}
          </Button>
        }
      />

      {keys.length > 0 && <KeyStats keys={keys} />}

      {keys.length > 0 && (
        <Box className={classes.toolbar}>
          <TextInput
            className={classes.search}
            size="sm"
            leftSection={<Search size={14} />}
            placeholder={t("developers.searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
          />
          <Text size="xs" c="dimmed">
            {t("developers.keyCount", { count: keys.length })}
          </Text>
        </Box>
      )}

      {isLoading ? (
        <Stack gap="xs" p="lg">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} height={40} radius="sm" />
          ))}
        </Stack>
      ) : loadFailed ? (
        <Box className={classes.emptyWrap}>
          <ErrorState
            compact
            title={t("developers.loadError")}
            onRetry={() => void retry()}
            retrying={retrying}
          />
        </Box>
      ) : keys.length === 0 ? (
        <Box className={classes.emptyWrap}>
          <EmptyState
            compact
            icon={KeyRound}
            title={t("developers.emptyTitle")}
            description={t("developers.emptyBody")}
            action={{ label: t("developers.emptyCta"), icon: Plus, onClick: openCreate }}
          />
        </Box>
      ) : filtered.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="xl" className={classes.emptyWrap}>
          {t("developers.noMatches", { query })}
        </Text>
      ) : (
        <ApiKeysTable keys={filtered} onRename={setRenamingKey} onRevoke={revoke} />
      )}

      <Box className={classes.footnote}>
        <ShieldCheck size={14} className={classes.footnoteIcon} />
        <span>{t("developers.securityNote")}</span>
      </Box>

      <CreateKeyModal
        opened={creatingOpen}
        onClose={() => setCreatingOpen(false)}
        workspaceName={workspaceName}
        creating={creating}
        onCreate={create}
      />
      <RenameKeyModal
        apiKey={renamingKey}
        saving={renaming}
        onClose={() => setRenamingKey(null)}
        onSave={rename}
      />
    </Box>
  );
}
