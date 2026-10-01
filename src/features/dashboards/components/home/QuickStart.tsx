import { Link } from "react-router-dom";
import { UnstyledButton } from "@mantine/core";
import { ArrowRight, LayoutGrid } from "lucide-react";
import { BLANK_TEMPLATE, TEMPLATES } from "@/features/dashboards/templates";
import type { DashboardTemplate } from "@/features/dashboards/templates";
import shared from "@/features/dashboards/components/Dashboards.module.css";
import classes from "@/features/dashboards/components/home/Home.module.css";

function QuickChip({ template, onOpen }: { template: DashboardTemplate; onOpen: () => void }) {
  const Icon = template.id === "blank" ? LayoutGrid : template.icon;
  return (
    <UnstyledButton className={`${classes.quickChip} ${shared.accent}`} data-accent={template.accent} onClick={onOpen}>
      <span className={classes.quickIcon}><Icon size={14} /></span>
      <span className={classes.quickText}>
        <span className={classes.quickName}>{template.id === "blank" ? "Blank canvas" : template.name}</span>
        <span className={classes.quickMeta}>
          {template.layout.length ? `${template.layout.length} widgets` : "Your pick"}
        </span>
      </span>
    </UnstyledButton>
  );
}

export function QuickStart({ onOpen }: { onOpen: (template: DashboardTemplate) => void }) {
  return (
    <section className={classes.quick}>
      <div className={classes.sectionHead}>
        <div>
          <h3 className={classes.sectionTitle}>Start another</h3>
          <p className={classes.sectionText}>Preview any layout and create it in seconds.</p>
        </div>
        <Link to="/app/dashboards/new" className={classes.seeAll}>
          All templates <ArrowRight size={14} />
        </Link>
      </div>
      <div className={classes.quickRow}>
        <QuickChip template={BLANK_TEMPLATE} onOpen={() => onOpen(BLANK_TEMPLATE)} />
        {TEMPLATES.map((t) => (
          <QuickChip key={t.id} template={t} onOpen={() => onOpen(t)} />
        ))}
      </div>
    </section>
  );
}
