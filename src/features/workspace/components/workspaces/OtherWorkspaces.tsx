import { UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { PlanIcon } from "@/features/billing/components/PlanIcons";
import { WorkspaceIcon } from "@/features/workspace/components/picker/WorkspaceIcon";
import { shortDate } from "@/shared/lib";
import type { Workspace } from "@/shared/types";
import { roleLabel } from "./format";
import classes from "./Workspaces.module.css";

interface Props {
  workspaces: Workspace[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function OtherWorkspaces({ workspaces, activeId, onSelect }: Props) {
  const { t } = useTranslation();
  const others = workspaces.filter((w) => w._id !== activeId);

  if (others.length === 0) return null;

  return (
    <section className={classes.others} aria-labelledby="other-workspaces-title">
      <h2 id="other-workspaces-title" className={classes.othersTitle}>
        {t("workspaces.otherWorkspaces")}
      </h2>

      <div className={classes.othersGrid}>
        {others.map((w) => {
          const plan = w.billing?.plan;
          const renews = w.billing?.currentPeriodEnd;
          return (
            <UnstyledButton
              key={w._id}
              className={`connection-card ${classes.otherCard}`}
              onClick={() => onSelect(w._id)}
            >
              <span className={classes.otherTop}>
                <WorkspaceIcon icon={w.icon} size="sm" />
                <span className={classes.otherOpen}>{t("workspaces.open")}</span>
              </span>

              <span className={classes.otherName} title={w.name}>{w.name}</span>
              <span className={classes.otherRole}>{roleLabel(w.role)}</span>

              <span className={classes.otherFoot}>
                <span className={classes.otherPlan}>
                  {plan && <PlanIcon slug={plan.slug} size={16} uid={`other-${w._id}`} />}
                  {plan && t("workspaces.planLabel", { plan: plan.name })}
                </span>
                <span className={classes.otherHint}>
                  {renews
                    ? t("workspaces.renews", { date: shortDate(renews) })
                    : t("workspaces.noRenewal")}
                </span>
              </span>
            </UnstyledButton>
          );
        })}
      </div>
    </section>
  );
}
