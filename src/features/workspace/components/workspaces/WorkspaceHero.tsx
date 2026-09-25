import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ActionIcon, Box, Button, Group, Menu, TextInput } from "@mantine/core";
import {
  CalendarDays, Check, Copy, Globe, MoreHorizontal, Pencil, Plus, ShieldCheck, Trash2, Users, X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { shortDate } from "@/shared/lib";
import type { Workspace } from "@/shared/types";
import { PlanIcon } from "@/features/billing/components/PlanIcons";
import { WorkspaceMark } from "./WorkspaceMark";
import { roleLabel } from "./format";
import classes from "./Workspaces.module.css";

interface Props {
  workspace: Workspace;
  siteCount: number;
  canEdit: boolean;
  canAdmin: boolean;
  canDelete: boolean;
  validateName: (name: string) => string | null;
  onRename: (name: string) => Promise<boolean>;
  renaming: boolean;
  onAddSite: () => void;
  onDelete: () => void;
}

/** The current workspace, front and centre: who it is, what it's on, and what you can do with it. */
export function WorkspaceHero({
  workspace,
  siteCount,
  canEdit,
  canAdmin,
  canDelete,
  validateName,
  onRename,
  renaming,
  onAddSite,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const error = editing ? validateName(name) : null;

  const billing = workspace.billing;
  const quota = billing ? billing.sites.quota + (billing.sites.addonSlots ?? 0) : 0;
  const used = billing?.sites.used ?? siteCount;
  const pct = quota ? Math.min(100, Math.round((used / quota) * 100)) : 0;
  const expired = billing?.status === "expired";

  const startEditing = () => {
    setName(workspace.name);
    setEditing(true);
  };

  const save = async () => {
    if (error) return;
    if (await onRename(name)) setEditing(false);
  };

  return (
    <Box component="header" className={classes.hero}>

      <Box className={classes.heroTop}>
        <WorkspaceMark size="lg" />

        <Box className={classes.heroText}>
          <div className={classes.heroEyebrow}>{t("workspaces.currentWorkspace", "Current workspace")}</div>
          {editing ? (
            <Group gap="xs" wrap="nowrap" mt={4}>
              <TextInput
                value={name}
                error={name ? error : null}
                onChange={(e) => setName(e.currentTarget.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void save();
                  if (e.key === "Escape") setEditing(false);
                }}
                w={280}
                autoFocus
                aria-label={t("workspaces.nameLabel")}
              />
              <ActionIcon
                variant="filled"
                size="lg"
                onClick={() => void save()}
                loading={renaming}
                disabled={!!error}
                aria-label={t("common.saveShort")}
              >
                <Check size={16} />
              </ActionIcon>
              <ActionIcon variant="default" size="lg" onClick={() => setEditing(false)} aria-label={t("common.cancel")}>
                <X size={16} />
              </ActionIcon>
            </Group>
          ) : (
            <h2 className={classes.heroName} title={workspace.name}>
              {workspace.name}
            </h2>
          )}
          <div className={classes.heroChips}>
            <span className={classes.chip}>
              <ShieldCheck size={13} />
              {roleLabel(workspace.role)}
            </span>
            {billing?.plan?.name && (
              <span className={classes.chip} data-tone={expired ? "warn" : undefined}>
                <PlanIcon slug={billing.plan.slug} size={13} uid="ws-hero-chip" />
                {billing.plan.name}
                {expired ? ` · ${t("workspaces.expired", "Expired")}` : ""}
              </span>
            )}
            <span className={classes.chip}>
              <CalendarDays size={13} />
              {t("workspaces.statCreated")} {shortDate(workspace.createdAt)}
            </span>
          </div>
        </Box>

        <Box className={classes.heroActions}>
          <Button variant="default" leftSection={<Users size={15} />} onClick={() => nav("/app/members")}>
            {t("workspaces.members", "Members")}
          </Button>
          {canEdit && (
            <Button leftSection={<Plus size={15} />} onClick={onAddSite}>
              {t("workspaces.addSite")}
            </Button>
          )}
          {(canAdmin || canDelete) && (
            <Menu position="bottom-end" withinPortal shadow="md" width={210}>
              <Menu.Target>
                <ActionIcon variant="default" size={36} aria-label={t("workspaces.moreActions", "More actions")}>
                  <MoreHorizontal size={17} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {canAdmin && (
                  <Menu.Item leftSection={<Pencil size={14} />} onClick={startEditing}>
                    {t("workspaces.rename")}
                  </Menu.Item>
                )}
                <Menu.Item
                  leftSection={<Copy size={14} />}
                  onClick={() => void navigator.clipboard.writeText(workspace._id)}
                >
                  {t("workspaces.copyId", "Copy workspace ID")}
                </Menu.Item>
                {canDelete && (
                  <>
                    <Menu.Divider />
                    <Menu.Item className="danger-item" color="red" leftSection={<Trash2 size={14} />} onClick={onDelete}>
                      {t("workspaces.deleteWorkspace")}
                    </Menu.Item>
                  </>
                )}
              </Menu.Dropdown>
            </Menu>
          )}
        </Box>
      </Box>

      <Box className={classes.stats}>
        <Stat icon={<Globe size={14} />} label={t("workspaces.statSites")}>
          <span className={classes.statValue}>
            {used}
            {quota > 0 && <span className={classes.statOf}> / {quota}</span>}
          </span>
          {quota > 0 && (
            <div className={classes.meter} aria-hidden>
              <div className={classes.meterFill} style={{ width: `${pct}%` }} data-full={pct >= 100 || undefined} />
            </div>
          )}
        </Stat>
        <Stat
          icon={billing?.plan ? <PlanIcon slug={billing.plan.slug} size={14} uid="ws-hero-stat" /> : null}
          label={t("workspaces.statPlan", "Plan")}
        >
          <span className={classes.statValue}>{billing?.plan?.name ?? "—"}</span>
          <span className={classes.statHint}>
            {expired
              ? t("workspaces.planExpired", "Lapsed — renew to keep tracking")
              : billing?.currentPeriodEnd
                ? t("workspaces.renews", { date: shortDate(billing.currentPeriodEnd), defaultValue: "Renews {{date}}" })
                : t("workspaces.noRenewal", "No renewal date")}
          </span>
        </Stat>
        <Stat icon={<ShieldCheck size={14} />} label={t("workspaces.statRole", "Your role")}>
          <span className={classes.statValue}>{roleLabel(workspace.role)}</span>
          <span className={classes.statHint}>
            {canAdmin
              ? t("workspaces.roleFull", "Full access to settings")
              : canEdit
                ? t("workspaces.roleEdit", "Can add and edit sites")
                : t("workspaces.roleView", "Read-only access")}
          </span>
        </Stat>
      </Box>
    </Box>
  );
}

function Stat({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className={classes.stat}>
      <div className={classes.statLabel}>
        {icon}
        {label}
      </div>
      {children}
    </div>
  );
}
