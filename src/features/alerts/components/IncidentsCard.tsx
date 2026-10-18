import { Button } from "@mantine/core";
import { Link } from "react-router-dom";
import { timeAgo } from "@/shared/lib/format";
import { RULE_META } from "@/features/alerts/lib/alertMeta";
import type { AlertIncident } from "@/features/alerts/types";
import classes from "@/features/alerts/components/Alerts.module.css";

export function IncidentsCard({ incidents }: { incidents: AlertIncident[] }) {
  if (!incidents.length) return null;

  return (
    <section className={classes.incidents}>
      <div className={classes.cardHead}>
        <div>
          <h3 className={classes.cardTitle}>Happening now</h3>
          <div className={classes.cardSub}>These stay here until they clear on their own. You will not be alerted again meanwhile.</div>
        </div>
      </div>
      {incidents.map((incident) => {
        const meta = RULE_META[incident.rule];
        const Icon = meta.icon;
        return (
          <div key={incident.id} className={classes.incident}>
            <span className={classes.icon} data-tone={meta.tone}>
              <Icon size={17} />
            </span>
            <div className={classes.text}>
              <div className={classes.title}>{incident.title}</div>
              <div className={classes.description}>{incident.summary}</div>
            </div>
            <div className={classes.channelState}>
              <span className={classes.since}>Since {timeAgo(incident.since)}</span>
              {incident.link && (
                <Button size="xs" variant="default" component={Link} to={incident.link}>
                  Look into it
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}
