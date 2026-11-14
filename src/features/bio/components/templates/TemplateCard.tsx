import { memo, useMemo } from "react";
import { UnstyledButton } from "@mantine/core";
import { BIO_KIND_LABEL, layoutFor, layoutsFor } from "@/features/bio/lib/bioOptions";
import { templatePreview } from "@/features/bio/templates/bioTemplates";
import type { BioTemplate } from "@/features/bio/templates/templateTypes";
import { PhoneThumb } from "../PhoneThumb";
import classes from "./TemplateGallery.module.css";

function layoutLabel(template: BioTemplate): string {
  const layout = layoutFor(template.kind, template.theme.layout);
  return layoutsFor(template.kind).find((o) => o.value === layout)?.label ?? "";
}

export const TemplateCard = memo(function TemplateCard({
  template,
  onPick,
}: {
  template: BioTemplate;
  onPick: (template: BioTemplate) => void;
}) {
  const page = useMemo(() => templatePreview(template), [template]);

  return (
    <UnstyledButton className={classes.card} onClick={() => onPick(template)} aria-label={`Use the ${template.name} template`}>
      <PhoneThumb page={page} className={classes.phone} />
      <div className={classes.body}>
        <span className={classes.name}>{template.name}</span>
        <span className={classes.meta}>
          {BIO_KIND_LABEL[template.kind]} · {layoutLabel(template)}
        </span>
        <span className={classes.text}>{template.description}</span>
      </div>
    </UnstyledButton>
  );
});
