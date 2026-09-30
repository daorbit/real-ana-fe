import { useState } from "react";
import { UnstyledButton } from "@mantine/core";
import { Plus } from "lucide-react";
import { TemplateCard } from "@/features/dashboards/components/TemplateCard";
import {
  BLANK_TEMPLATE, CATEGORY_DESCRIPTIONS, TEMPLATES, TEMPLATE_CATEGORIES,
} from "@/features/dashboards/templates";
import type { DashboardTemplate, TemplateCategory } from "@/features/dashboards/templates";
import classes from "@/features/dashboards/components/Dashboards.module.css";

type Filter = "All" | TemplateCategory;

const CATEGORY_ACCENT: Record<TemplateCategory, string> = {
  Business: "violet",
  Marketing: "orange",
  Content: "blue",
  Product: "cyan",
};

export function TemplateGallery({ onOpen }: { onOpen: (template: DashboardTemplate) => void }) {
  const [filter, setFilter] = useState<Filter>("All");
  const groups = TEMPLATE_CATEGORIES.filter((c) => filter === "All" || c === filter).map((category) => ({
    category,
    items: TEMPLATES.filter((t) => t.category === category),
  }));

  return (
    <div className={classes.browser}>
      <aside className={classes.side}>
        <div className={classes.sideLabel}>Categories</div>
        <UnstyledButton
          className={classes.sideItem}
          data-active={filter === "All" || undefined}
          onClick={() => setFilter("All")}
        >
          <span className={classes.sideDot} />
          All templates
          <span className={classes.sideCount}>{TEMPLATES.length}</span>
        </UnstyledButton>
        {TEMPLATE_CATEGORIES.map((c) => (
          <UnstyledButton
            key={c}
            className={`${classes.sideItem} ${classes.accent}`}
            data-accent={CATEGORY_ACCENT[c]}
            data-active={filter === c || undefined}
            onClick={() => setFilter(c)}
          >
            <span className={classes.sideDot} />
            {c}
            <span className={classes.sideCount}>{TEMPLATES.filter((t) => t.category === c).length}</span>
          </UnstyledButton>
        ))}

        <UnstyledButton
          className={`${classes.scratch} ${classes.accent}`}
          data-accent={BLANK_TEMPLATE.accent}
          onClick={() => onOpen(BLANK_TEMPLATE)}
        >
          <span className={classes.galleryIcon}><Plus size={16} /></span>
          <span className={classes.scratchTitle}>Start from scratch</span>
          <span className={classes.scratchText}>An empty canvas. Add only the widgets you want.</span>
        </UnstyledButton>
      </aside>

      <div className={classes.sections}>
        {groups.map((g) => (
          <section key={g.category}>
            <div className={classes.sectionHead}>
              <h3 className={classes.sectionName}>{g.category}</h3>
              <span className={classes.sectionDesc}>{CATEGORY_DESCRIPTIONS[g.category]}</span>
              <span className={classes.sectionCount}>{g.items.length} templates</span>
            </div>
            <div className={classes.galleryGrid}>
              {g.items.map((t, i) => (
                <TemplateCard key={t.id} template={t} index={i} onOpen={() => onOpen(t)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
