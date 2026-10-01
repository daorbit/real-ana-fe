import { Link } from "react-router-dom";
import { ArrowRight, CodeXml, LayoutGrid, LayoutTemplate } from "lucide-react";
import { StartOption } from "@/features/dashboards/components/home/StartOption";
import { TemplateCard } from "@/features/dashboards/components/templates/TemplateCard";
import { useTemplateFlow } from "@/features/dashboards/hooks/useTemplateFlow";
import { BLANK_TEMPLATE, FEATURED_TEMPLATE_IDS, TEMPLATES, TEMPLATE_MAP } from "@/features/dashboards/templates";
import classes from "@/features/dashboards/components/home/Home.module.css";
import templateClasses from "@/features/dashboards/components/templates/Templates.module.css";

export function StartPanel({ workspaceId, onEmbed }: { workspaceId: string; onEmbed: () => void }) {
  const { openTemplate, dialogs } = useTemplateFlow(workspaceId);
  const featured = FEATURED_TEMPLATE_IDS.map((id) => TEMPLATE_MAP[id]).filter(Boolean);

  return (
    <div className={classes.start}>
      <div className={classes.options}>
        <StartOption
          primary
          icon={LayoutTemplate}
          title="Start from a template"
          text={`${TEMPLATES.length} ready-made layouts for stores, SaaS, agencies, SEO and more.`}
          cta="Browse templates"
          to="/app/dashboards/new"
        />
        <StartOption
          icon={LayoutGrid}
          title="Blank canvas"
          text="Pick every widget yourself and arrange them however you like."
          cta="Start blank"
          onClick={() => openTemplate(BLANK_TEMPLATE)}
        />
        <StartOption
          icon={CodeXml}
          title="Embed one widget"
          text="Put a single live chart or KPI on your site, a client portal or Notion."
          cta="Embed a widget"
          onClick={onEmbed}
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
            <TemplateCard key={t.id} template={t} index={i} onOpen={() => openTemplate(t)} />
          ))}
        </div>
      </section>

      {dialogs}
    </div>
  );
}
