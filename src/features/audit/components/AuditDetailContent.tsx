import { useEffect, useState, type ReactNode } from "react";
import { ActionIcon, Collapse, CopyButton, Tooltip, UnstyledButton } from "@mantine/core";
import { ArrowRight, Check, ChevronDown, Copy } from "lucide-react";
import { dateTime } from "@/shared/lib/format";
import type { AuditEntry } from "@/shared/types";
import { actorName } from "../lib/auditCopy";
import { changeOf, kindLabel, metaRows } from "../lib/detailRows";
import classes from "./AuditDetail.module.css";

function Row({ label, children, mono = false }: { label: string; children: ReactNode; mono?: boolean }) {
  return (
    <div className={classes.row}>
      <dt className={classes.key}>{label}</dt>
      <dd className={classes.value} data-mono={mono || undefined}>
        {children}
      </dd>
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
        <ChevronDown size={15} className={classes.chevron} data-open={open || undefined} />
      </UnstyledButton>
      <Collapse expanded={open}>
        <dl className={classes.technicalList}>
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
        </dl>
      </Collapse>
    </div>
  );
}

export function AuditDetailContent({ entry }: { entry: AuditEntry }) {
  const change = changeOf(entry);
  const details = metaRows(entry);
  const device = [entry.browser, entry.os].filter(Boolean).join(" on ");

  return (
    <div className={classes.content}>
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

      <dl className={classes.list}>
        <Row label="Person">
          {actorName(entry)}
          {entry.viaSupport && <span className={classes.support}>Via support</span>}
        </Row>
        <Row label="Email">{entry.actor?.email || "No email on record"}</Row>
        <Row label="When">{dateTime(entry.createdAt)}</Row>
        {entry.target.label && <Row label={kindLabel(entry.target.kind)}>{entry.target.label}</Row>}
        {device && <Row label="Device">{device}</Row>}
        {entry.location && <Row label="Location">{entry.location}</Row>}
        {details.map((row) => (
          <Row key={row.key} label={row.key}>
            {row.value}
          </Row>
        ))}
      </dl>

      <Technical entry={entry} />
    </div>
  );
}
