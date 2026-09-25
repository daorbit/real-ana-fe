import { useMemo, useState } from "react";
import { Button, Skeleton, Stack, Text, TextInput } from "@mantine/core";
import { KeyRound, Plus, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { EmptyState } from "@/shared/ui/EmptyState";
import { ErrorState } from "@/shared/ui/ErrorState";
import type { ApiKey, ApiKeyUsageWindow } from "@/shared/types";
import { useApiKeys } from "../../hooks/useApiKeys";
import { useKeyUsage } from "../../hooks/useKeyUsage";
import { ApiKeysTable } from "./ApiKeysTable";
import { CreateKeyModal } from "./CreateKeyModal";
import { RenameKeyModal } from "./RenameKeyModal";
import { SectionHeader } from "./SectionHeader";
import classes from "./Developers.module.css";

interface Props {
  workspaceId: string;
  workspaceName: string;
  windowDays: ApiKeyUsageWindow;
  onViewUsage: (keyId: string) => void;
}

export function ApiKeysPanel({ workspaceId, workspaceName, windowDays, onViewUsage }: Props) {
  const { t } = useTranslation();
  const {
    keys, isLoading, loadFailed, retrying, retry, creating, renaming, create, rename, revoke,
  } = useApiKeys(workspaceId);
  const { byKey } = useKeyUsage(workspaceId, windowDays, null);
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
    <div>
      <SectionHeader
        description={t("developers.keysIntro", { workspace: workspaceName })}
        action={
          <>
            {keys.length > 0 && (
              <TextInput
                className={classes.search}
                size="sm"
                leftSection={<Search size={14} />}
                placeholder={t("developers.searchPlaceholder")}
                aria-label={t("developers.searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.currentTarget.value)}
              />
            )}
            <Button size="sm" leftSection={<Plus size={15} />} onClick={openCreate}>
              {t("developers.createKey")}
            </Button>
          </>
        }
      />

      <div className={classes.card}>
        {isLoading ? (
          <Stack gap="xs" p="md">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} height={36} radius="sm" />
            ))}
          </Stack>
        ) : loadFailed ? (
          <ErrorState compact title={t("developers.loadError")} onRetry={() => void retry()} retrying={retrying} />
        ) : keys.length === 0 ? (
          <EmptyState
            compact
            icon={KeyRound}
            title={t("developers.emptyTitle")}
            description={t("developers.emptyBody")}
            action={{ label: t("developers.emptyCta"), icon: Plus, onClick: openCreate }}
          />
        ) : filtered.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            {t("developers.noMatches", { query })}
          </Text>
        ) : (
          <ApiKeysTable
            keys={filtered}
            usage={byKey}
            windowDays={windowDays}
            onViewUsage={onViewUsage}
            onRename={setRenamingKey}
            onRevoke={revoke}
          />
        )}
      </div>

      <p className={classes.note}>{t("developers.securityNote")}</p>

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
    </div>
  );
}
