import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, LayoutTemplate } from "lucide-react";
import { OrbitMark } from "@/features/orbit/components/OrbitMark";
import { StartOption } from "@/features/dashboards/components/home/StartOption";
import { TemplateCard } from "@/features/dashboards/components/templates/TemplateCard";
import { BLANK_TEMPLATE, FEATURED_TEMPLATE_IDS, TEMPLATES, TEMPLATE_MAP } from "@/features/dashboards/templates";
import type { DashboardTemplate } from "@/features/dashboards/templates";
import classes from "@/features/dashboards/components/home/Home.module.css";
import templateClasses from "@/features/dashboards/components/templates/Templates.module.css";

export function StartPanel({
  onTemplate,
  onOrbit,
}: {
  onTemplate: (template: DashboardTemplate) => void;
  onOrbit: () => void;
}) {
  const featured = FEATURED_TEMPLATE_IDS.map((id) => TEMPLATE_MAP[id]).filter(Boolean);

  return (
    <div className={classes.start}>
      <div className={classes.options}>
        <StartOption
          primary
          badge="New"
          icon={<OrbitMark size={24} />}
          title="Build with Orbit AI"
          text="Describe what you want to track in a sentence. Orbit picks the widgets and lays them out for you."
          cta="Describe your dashboard"
          onClick={onOrbit}
        />
        <StartOption
          icon={<LayoutTemplate size={20} />}
          title="Start from a template"
          text={`${TEMPLATES.length} ready-made layouts for stores, SaaS, agencies, SEO and more.`}
          cta="Browse templates"
          to="/app/dashboards/new"
        />
        <StartOption
          icon={<LayoutGrid size={20} />}
          title="Blank canvas"
          text="Pick every widget yourself and arrange them however you like."
          cta="Start blank"
          onClick={() => onTemplate(BLANK_TEMPLATE)}
        />
      </div>

      <section>
        <div className={classes.sectionHead}>
          <div>
            <h3 className={classes.sectionTitle}>Popular templates</h3>
            <p className={classes.sectionText}>Preview one, name it, and it's ready in seconds.</p>
          </div>
          <Link to="/app/dashboards/new" className={classes.seeAll}>
            See all {TEMPLATES.length} <ArrowRight size={14} />
          </Link>
        </div>
        <div className={templateClasses.grid}>
          {featured.map((t, i) => (
            <TemplateCard key={t.id} template={t} index={i} onOpen={() => onTemplate(t)} />
          ))}
        </div>
      </section>
    </div>
  );
}
