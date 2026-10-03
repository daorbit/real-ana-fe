import { Link } from "react-router-dom";
import { ArrowRight, Plus } from "lucide-react";
import { OrbitBanner } from "@/features/dashboards/components/home/OrbitBanner";
import { StartOption, StartTemplate } from "@/features/dashboards/components/home/StartOption";
import { BLANK_TEMPLATE, TEMPLATES } from "@/features/dashboards/templates";
import type { DashboardTemplate } from "@/features/dashboards/templates";
import classes from "@/features/dashboards/components/home/Home.module.css";

/** One popular layout each from business, marketing and search. */
const FEATURED_IDS = ["executive", "campaigns", "seo"];
const FEATURED = FEATURED_IDS.map((id) => TEMPLATES.find((t) => t.id === id)).filter(
  (t): t is DashboardTemplate => Boolean(t),
);

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

      <section aria-labelledby="start-alts-title">
        <div className={classes.altHeader}>
          <div>
            <h3 id="start-alts-title" className={classes.altHeading}>Or start without AI</h3>
            <p className={classes.altSub}>Begin from a proven layout, or place every widget yourself.</p>
          </div>
          <Link to="/app/dashboards/new" className={classes.altAll}>
            All {TEMPLATES.length} templates
            <ArrowRight size={14} />
          </Link>
        </div>

        <div className={classes.alts}>
          <StartOption
            icon={<Plus size={18} />}
            title="Blank canvas"
            text="An empty dashboard. Pick every widget and arrange it your way."
            onClick={() => onTemplate(BLANK_TEMPLATE)}
          />
          {FEATURED.map((t) => (
            <StartTemplate key={t.id} template={t} onOpen={() => onTemplate(t)} />
          ))}
        </div>
      </section>
    </div>
  );
}
