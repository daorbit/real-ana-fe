import { UnstyledButton } from "@mantine/core";
import { Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { shortDate } from "@/shared/lib";
import type { Workspace } from "@/shared/types";
import { WorkspaceMark } from "./WorkspaceMark";
import { roleLabel } from "./format";
import classes from "./Workspaces.module.css";

interface Props {
  workspaces: Workspace[];
  activeId: string;
  onSelect: (id: string) => void;
}

/**
 * Every workspace as a card. Picking one makes it the current workspace — the
 * one every other page reads from — and shows its sites underneath.
 */
export function WorkspaceGrid({ workspaces, activeId, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <div className={classes.grid}>
      {workspaces.map((w) => {
        const isActive = w._id === activeId;
        const sites = w.billing?.sites.used ?? 0;
        return (
          <UnstyledButton
            key={w._id}
            className={classes.wsCard}
            data-active={isActive || undefined}
            aria-current={isActive ? "true" : undefined}
            onClick={() => onSelect(w._id)}
          >
            <div className={classes.wsCardTop}>
              <WorkspaceMark name={w.name} size="md" />
              <div className={classes.wsCardText}>
                <div className={classes.wsCardName}>{w.name}</div>
                <div className={classes.wsCardMeta}>
                  {roleLabel(w.role)}
                  {w.billing?.plan?.name ? ` · ${w.billing.plan.name}` : ""}
                </div>
              </div>
              {isActive && <span className={classes.current}>{t("workspaces.current", "Current")}</span>}
            </div>

            <div className={classes.wsCardFoot}>
              <span>
                <Globe size={13} />
                {t("workspaces.siteCount", { count: sites, defaultValue_one: "{{count}} site", defaultValue_other: "{{count}} sites" })}
              </span>
              <span>
                {t("workspaces.statCreated")} {shortDate(w.createdAt)}
              </span>
            </div>
          </UnstyledButton>
        );
      })}
    </div>
  );
}
