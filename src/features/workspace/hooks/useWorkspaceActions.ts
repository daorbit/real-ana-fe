import { useTranslation } from "react-i18next";
import {
  useRenameWorkspaceMutation,
  useDeleteWorkspaceMutation,
  useDeleteSiteMutation,
} from "@/app/store";
import { useAuth } from "@/features/auth/context";
import { notify, errMessage, confirmDestroy } from "@/shared/lib/notify";
import { trace } from "@/shared/lib/analytics";
import * as v from "@/shared/lib/validate";
import type { Site, Workspace } from "@/shared/types";

export function useWorkspaceActions(active: Workspace | null, siteCount: number) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [renameWs, { isLoading: renaming }] = useRenameWorkspaceMutation();
  const [deleteWs] = useDeleteWorkspaceMutation();
  const [deleteSiteMut] = useDeleteSiteMutation();

  const validateName = (name: string) =>
    v.all(v.required(t("workspaces.nameLabel")), v.maxLength(t("workspaces.nameLabel"), 60))(name);

  const rename = async (name: string): Promise<boolean> => {
    if (!active || validateName(name)) return false;
    if (name.trim() === active.name) return true;
    trace(user?.id, "rename_workspace", "workspaces", "workspaces");
    try {
      await renameWs({ id: active._id, name: name.trim() }).unwrap();
      notify.success(t("workspaces.renamedToast"));
      return true;
    } catch (err) {
      notify.error(errMessage(err, t("workspaces.renameError")));
      return false;
    }
  };

  const removeWorkspace = (w: Workspace) => {
    const count = w._id === active?._id ? siteCount : null;
    confirmDestroy({
      title: t("workspaces.deleteWsTitle", { name: w.name }),
      phrase: w.name,
      body: t("workspaces.deleteWsBody"),
      consequences: [
        count === null
          ? t("workspaces.deleteWsConsequenceAllSites")
          : t("workspaces.deleteWsConsequenceSites", { count }),
        t("workspaces.deleteWsConsequenceHistory"),
        t("workspaces.deleteWsConsequenceLinks"),
        t("workspaces.deleteWsConsequenceSnippet"),
      ],
      confirmLabel: t("workspaces.deleteWorkspace"),
      onConfirm: async () => {
        trace(user?.id, "delete_workspace", "workspaces", "workspaces");
        try {
          await deleteWs(w._id).unwrap();
          notify.success(t("workspaces.deletedWsToast", { name: w.name }));
        } catch (err) {
          notify.error(errMessage(err, t("workspaces.deleteWsError")));
        }
      },
    });
  };

  const removeSite = (s: Site) => {
    if (!active) return;
    confirmDestroy({
      title: t("workspaces.deleteSiteTitle", { name: s.name }),
      phrase: s.name,
      body: t("workspaces.deleteSiteBody", { domain: s.domain }),
      consequences: [
        t("workspaces.deleteSiteConsequenceData"),
        t("workspaces.deleteSiteConsequenceLink"),
        t("workspaces.deleteSiteConsequenceSnippet"),
      ],
      confirmLabel: t("workspaces.deleteSite"),
      onConfirm: async () => {
        trace(user?.id, "delete_site", "workspaces", "workspaces");
        try {
          await deleteSiteMut({ workspaceId: active._id, siteId: s.siteId }).unwrap();
          notify.success(t("workspaces.deletedSiteToast", { name: s.name }));
        } catch (err) {
          notify.error(errMessage(err, t("workspaces.deleteSiteError")));
        }
      },
    });
  };

  return { validateName, rename, renaming, removeWorkspace, removeSite };
}
