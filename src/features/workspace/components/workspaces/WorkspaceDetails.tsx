import { useTranslation } from "react-i18next";
import { shortDate } from "@/shared/lib";
import type { Workspace } from "@/shared/types";
import { Stat } from "./Stat";
import { roleLabel } from "./format";
import classes from "./Workspaces.module.css";

interface Props {
  workspace: Workspace;
  canEdit: boolean;
  canAdmin: boolean;
}

export function WorkspaceDetails({ workspace, canEdit, canAdmin }: Props) {
  const { t } = useTranslation();
  const billing = workspace.billing;
  const expired = billing?.status === "expired";

  const roleHint = canAdmin
    ? t("workspaces.roleFull")
    : canEdit
      ? t("workspaces.roleEdit")
      : t("workspaces.roleView");

  return (
    <section className={`${classes.card} ${classes.stats}`} data-size="details" aria-label={t("workspaces.detailsLabel")}>
      <Stat
        label={t("workspaces.statRenewal")}
        value={billing?.currentPeriodEnd ? shortDate(billing.currentPeriodEnd) : t("workspaces.noRenewalShort")}
        hint={expired ? t("workspaces.planExpired") : undefined}
      />
      <Stat label={t("workspaces.statRole")} value={roleLabel(workspace.role)} hint={roleHint} />
      <Stat label={t("workspaces.statCreated")} value={shortDate(workspace.createdAt)} />
    </section>
  );
}
