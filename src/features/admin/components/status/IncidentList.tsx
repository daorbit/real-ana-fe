import { ChevronRight } from "lucide-react";
import { dateTime } from "@/shared/lib/format";
import { COMPONENT_LABEL, IMPACT_LABEL } from "../../status/labels";
import type { StatusIncident } from "../../status/types";
import classes from "./Status.module.css";

const TONE = { minor: "warn", major: "bad", maintenance: "info" } as const;

export function IncidentList({
  title,
  note,
  incidents,
  empty,
  onOpen,
}: {
  title: string;
  note?: string;
  incidents: StatusIncident[];
  empty: string;
  onOpen: (incident: StatusIncident) => void;
}) {
  return (
    <section className={classes.section}>
      <div className={classes.sectionHead}>
        <h3 className={classes.sectionTitle}>{title}</h3>
        {note && <span className={classes.sectionNote}>{note}</span>}
      </div>
      <div className={classes.group}>
        {incidents.length ? (
          incidents.map((incident) => (
            <button key={incident.id} type="button" className={classes.row} onClick={() => onOpen(incident)}>
              <span className={classes.dot} data-tone={incident.resolvedAt ? "good" : TONE[incident.impact]} aria-hidden />
              <span className={classes.main}>
                <span className={classes.title}>{incident.title}</span>
                <span className={classes.subtitle}>
                  {incident.statusLabel} · {IMPACT_LABEL[incident.impact]} · {incident.components.map((c) => COMPONENT_LABEL[c]).join(", ")} ·{" "}
                  {dateTime(incident.startedAt)}
                </span>
              </span>
              <ChevronRight size={16} aria-hidden />
            </button>
          ))
        ) : (
          <div className={classes.empty}>{empty}</div>
        )}
      </div>
    </section>
  );
}
