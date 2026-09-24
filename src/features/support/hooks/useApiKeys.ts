import { useTranslation } from "react-i18next";
import {
  useGetApiKeysQuery,
  useCreateApiKeyMutation,
  useRenameApiKeyMutation,
  useRevokeApiKeyMutation,
} from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage, confirmDelete } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import type { ApiKey } from "@/shared/types";

export function useApiKeys(workspaceId: string) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentData: keys = [], isLoading } = useGetApiKeysQuery(workspaceId, {
    skip: !workspaceId,
  });
  const [createMutation, { isLoading: creating }] = useCreateApiKeyMutation();
  const [renameMutation, { isLoading: renaming }] = useRenameApiKeyMutation();
  const [revokeMutation] = useRevokeApiKeyMutation();

  const create = async (name: string, expiresInDays: number | null): Promise<ApiKey | null> => {
    trace(user?.id, "api_key_created", "developers", "api_key");
    try {
      return await createMutation({
        workspaceId,
        name: name.trim() || t("developers.defaultKeyName"),
        expiresInDays,
      }).unwrap();
    } catch (err) {
      notify.error(errMessage(err, t("developers.createError")));
      return null;
    }
  };

  const rename = async (key: ApiKey, name: string): Promise<boolean> => {
    try {
      await renameMutation({ workspaceId, keyId: key.id, name: name.trim() }).unwrap();
      notify.success(t("developers.renamedToast"));
      return true;
    } catch (err) {
      notify.error(errMessage(err, t("developers.renameError")));
      return false;
    }
  };

  const revoke = (key: ApiKey) => {
    confirmDelete({
      title: t("developers.revokeTitle", { name: key.name }),
      body: t("developers.revokeBody"),
      confirmLabel: t("developers.revokeConfirm"),
      onConfirm: async () => {
        trace(user?.id, "api_key_revoked", "developers", "api_key");
        try {
          await revokeMutation({ workspaceId, keyId: key.id }).unwrap();
          notify.success(t("developers.revokedToast", { name: key.name }));
        } catch (err) {
          notify.error(errMessage(err, t("developers.revokeError")));
        }
      },
    });
  };

  return { keys, isLoading, creating, renaming, create, rename, revoke };
}
