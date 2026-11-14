import { useMemo, useState } from "react";
import { FilterChips } from "@/shared/ui/FilterChips";
import { BIO_TEMPLATES } from "@/features/bio/templates/bioTemplates";
import { TEMPLATE_CATEGORIES, type BioTemplate } from "@/features/bio/templates/templateTypes";
import { TemplateCard } from "./TemplateCard";
import classes from "./TemplateGallery.module.css";

export function TemplateGallery({ onPick }: { onPick: (template: BioTemplate) => void }) {
  const [category, setCategory] = useState("all");

  const chips = useMemo(
    () =>
      TEMPLATE_CATEGORIES.map((c) => ({
        value: c.value,
        label: c.label,
        count: String(c.value === "all" ? BIO_TEMPLATES.length : BIO_TEMPLATES.filter((t) => t.category === c.value).length),
      })),
    [],
  );
  const visible = category === "all" ? BIO_TEMPLATES : BIO_TEMPLATES.filter((t) => t.category === category);

  return (
    <div className={classes.wrap}>
      <FilterChips value={category} onChange={setCategory} data={chips} ariaLabel="Filter templates" />
      <div className={classes.grid}>
        {visible.map((template) => (
          <TemplateCard key={template.id} template={template} onPick={onPick} />
        ))}
      </div>
    </div>
  );
}
