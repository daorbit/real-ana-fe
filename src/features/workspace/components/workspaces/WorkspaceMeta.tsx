import { Button, CopyButton } from "@mantine/core";
import { Check, Copy } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PlanIcon } from "@/features/billing/components/PlanIcons";
import type { Workspace } from "@/shared/types";
import classes from "./Workspaces.module.css";

export function WorkspaceMeta({ workspace }: { workspace: Workspace }) {
  const { t } = useTranslation();
  const plan = workspace.billing?.plan;
  const expired = workspace.billing?.status === "expired";

  return (
    <span className={classes.meta}>
      {plan && (
        <>
          <span className={classes.metaPlan}>
            <PlanIcon slug={plan.slug} size={18} uid="ws-meta" />
            {t("workspaces.planLabel", { plan: plan.name })}
            {expired && <span className={classes.metaExpired}>{t("workspaces.expired")}</span>}
          </span>
          <span className={classes.metaRule} aria-hidden />
        </>
      )}
      <span className={classes.metaId}>
        {t("workspaces.workspaceId")}
        <code className={classes.metaCode} translate="no">{workspace._id}</code>
        <CopyButton value={workspace._id} timeout={1500}>
          {({ copied, copy }) => (
            <Button
              variant="default"
              size="compact-xs"
              radius="xl"
              leftSection={copied ? <Check size={12} /> : <Copy size={12} />}
              onClick={copy}
              aria-label={t("workspaces.copyId")}
            >
              {copied ? t("workspaces.copied") : t("workspaces.copy")}
            </Button>
          )}
        </CopyButton>
      </span>
    </span>
  );
}
