import { useMemo, useState } from "react";
import { FilterChips } from "@/shared/ui/FilterChips";
import { BIO_TEMPLATES } from "@/features/bio/templates/bioTemplates";
import { TEMPLATE_CATEGORIES, type BioTemplate } from "@/features/bio/templates/templateTypes";
import type { BioPageKind, PublicBioPage } from "@/features/bio/types";
import { TemplateCard } from "./TemplateCard";
import classes from "./TemplateGallery.module.css";

export function TemplateGallery({
  kind,
  activeId,
  previews,
  onPick,
}: {
  kind?: BioPageKind;
  activeId?: string | null;
  previews?: Map<string, PublicBioPage>;
  onPick: (template: BioTemplate) => void;
}) {
  const [category, setCategory] = useState("all");
  const templates = useMemo(() => (kind ? BIO_TEMPLATES.filter((t) => t.kind === kind) : BIO_TEMPLATES), [kind]);

  const chips = useMemo(
    () =>
      TEMPLATE_CATEGORIES.map((c) => ({
        value: c.value,
        label: c.label,
        count: c.value === "all" ? templates.length : templates.filter((t) => t.category === c.value).length,
      }))
        .filter((c) => c.count > 0)
        .map((c) => ({ ...c, count: String(c.count) })),
    [templates],
  );
  const visible = category === "all" ? templates : templates.filter((t) => t.category === category);

  return (
    <div className={classes.wrap}>
      <FilterChips value={category} onChange={setCategory} data={chips} ariaLabel="Filter templates" />
      <div className={classes.grid}>
        {visible.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            preview={previews?.get(template.id)}
            active={template.id === activeId}
            onPick={onPick}
          />
        ))}
      </div>
    </div>
  );
}
