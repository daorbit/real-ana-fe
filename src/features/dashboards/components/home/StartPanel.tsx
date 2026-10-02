import { LayoutGrid, LayoutTemplate } from "lucide-react";
import { OrbitBanner } from "@/features/dashboards/components/home/OrbitBanner";
import { StartOption } from "@/features/dashboards/components/home/StartOption";
import { BLANK_TEMPLATE, TEMPLATES } from "@/features/dashboards/templates";
import type { DashboardTemplate } from "@/features/dashboards/templates";
import classes from "@/features/dashboards/components/home/Home.module.css";

export function StartPanel({
  onTemplate,
  onOrbit,
}: {
  onTemplate: (template: DashboardTemplate) => void;
  onOrbit: (prompt?: string) => void;
}) {
  return (
    <div className={classes.start}>
      <OrbitBanner onStart={onOrbit} />

      <section>
        <h3 className={classes.altHeading}>Or start without AI</h3>
        <div className={classes.alts}>
          <StartOption
            icon={<LayoutTemplate size={18} />}
            title="Start from a template"
            text={`${TEMPLATES.length} ready-made layouts`}
            to="/app/dashboards/new"
          />
          <StartOption
            icon={<LayoutGrid size={18} />}
            title="Blank canvas"
            text="Pick every widget yourself"
            onClick={() => onTemplate(BLANK_TEMPLATE)}
          />
        </div>
      </section>
    </div>
  );
}
