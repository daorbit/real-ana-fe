import { useEffect, useState, type ReactNode } from "react";
import { ActionIcon, Collapse, CopyButton, Tooltip, UnstyledButton } from "@mantine/core";
import { ArrowRight, Check, ChevronDown, Copy } from "lucide-react";
import { PanelDrawer } from "@/shared/ui/PanelDrawer";
import { UserAvatar } from "@/shared/ui/UserAvatar";
import { dateTime, timeAgo } from "@/shared/lib/format";
import type { AuditEntry } from "@/shared/types";
import { actorName, describeTeamAction } from "../lib/auditCopy";
import { CATEGORY_META } from "../lib/categories";
import { changeOf, kindLabel, metaRows } from "../lib/detailRows";
import classes from "./AuditDetail.module.css";

function Row({ label, children, mono = false }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className={classes.row}>
      <span className={classes.key}>{label}</span>
      <span className={classes.value} data-mono={mono || undefined}>
        {children}
      </span>
    </div>
  );
}

function Copyable({ value }: { value: string }) {
  return (
    <span className={classes.copyable}>
      <span className={classes.copyText}>{value}</span>
      <CopyButton value={value} timeout={1500}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? "Copied" : "Copy"} withArrow>
            <ActionIcon variant="subtle" color="gray" size="sm" onClick={copy} aria-label={`Copy ${value}`}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </span>
  );
}

function Technical({ entry }: { entry: AuditEntry }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [entry.id]);

  return (
    <div className={classes.technical}>
      <UnstyledButton className={classes.technicalToggle} onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        Technical details
        <ChevronDown size={14} className={classes.chevron} data-open={open || undefined} />
      </UnstyledButton>
      <Collapse expanded={open}>
        <div className={classes.list}>
          <Row label="Action" mono>
            {entry.action}
          </Row>
          <Row label="Event ID" mono>
            <Copyable value={entry.id} />
          </Row>
          {entry.target.id && (
            <Row label="Item ID" mono>
              <Copyable value={entry.target.id} />
            </Row>
          )}
          {entry.ip && (
            <Row label="IP address" mono>
              <Copyable value={entry.ip} />
            </Row>
          )}
          <Row label="Recorded by">{entry.source === "forms" ? "Lead capture" : "Dashboard"}</Row>
        </div>
      </Collapse>
    </div>
  );
}

function Body({ entry }: { entry: AuditEntry }) {
  const name = actorName(entry);
  const change = changeOf(entry);
  const details = metaRows(entry);
  const device = [entry.browser, entry.os].filter(Boolean).join(" on ");

  return (
    <div className={classes.body}>
      <div className={classes.person}>
        <UserAvatar src={entry.actor?.avatarUrl} name={name} radius="xl" size={40} />
        <div className={classes.personText}>
          <div className={classes.personName}>{name}</div>
          <div className={classes.personEmail}>{entry.actor?.email || "No email on record"}</div>
        </div>
        {entry.viaSupport && <span className={classes.support}>Via support</span>}
      </div>

      {change && (
        <div className={classes.change}>
          <span className={classes.changeSide}>
            <span className={classes.changeLabel}>Before</span>
            <span className={classes.changeValue}>{change.from}</span>
          </span>
          <ArrowRight size={16} className={classes.changeArrow} />
          <span className={classes.changeSide}>
            <span className={classes.changeLabel}>After</span>
            <span className={classes.changeValue} data-after>
              {change.to}
            </span>
          </span>
        </div>
      )}

      <div className={classes.list}>
        <Row label="When">{dateTime(entry.createdAt)}</Row>
        {entry.target.label && <Row label={kindLabel(entry.target.kind)}>{entry.target.label}</Row>}
        {device && <Row label="Device">{device}</Row>}
        {entry.location && <Row label="Location">{entry.location}</Row>}
        {details.map((row) => (
          <Row key={row.key} label={row.key}>
            {row.value}
          </Row>
        ))}
      </div>

      <Technical entry={entry} />
    </div>
  );
}

export function AuditDetailDrawer({
  entry,
  opened,
  onClose,
}: {
  entry: AuditEntry | null;
  opened: boolean;
  onClose: () => void;
}) {
  const meta = entry ? CATEGORY_META[entry.category] : null;
  const Icon = meta?.icon;

  return (
    <PanelDrawer
      opened={opened && Boolean(entry)}
      onClose={onClose}
      ariaLabel="Audit entry"
      size={440}
      header={
        entry &&
        meta &&
        Icon && (
          <div className={classes.head}>
            <span className={classes.headIcon}>
              <Icon size={18} />
            </span>
            <div className={classes.headText}>
              <span className={classes.eyebrow}>
                {meta.label} · {timeAgo(entry.createdAt)}
              </span>
              <h2 className={classes.title}>
                {actorName(entry)} {describeTeamAction(entry)}
              </h2>
            </div>
          </div>
        )
      }
    >
      {entry && <Body entry={entry} />}
    </PanelDrawer>
  );
}
