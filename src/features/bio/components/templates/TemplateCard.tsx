import { memo, useMemo } from "react";
import { UnstyledButton } from "@mantine/core";
import { Check } from "lucide-react";
import { BIO_KIND_LABEL, layoutFor, layoutsFor } from "@/features/bio/lib/bioOptions";
import { templatePreview } from "@/features/bio/templates/bioTemplates";
import type { BioTemplate } from "@/features/bio/templates/templateTypes";
import type { PublicBioPage } from "@/features/bio/types";
import { PhoneThumb } from "../PhoneThumb";
import classes from "./TemplateGallery.module.css";

function layoutLabel(template: BioTemplate): string {
  const layout = layoutFor(template.kind, template.theme.layout);
  return layoutsFor(template.kind).find((o) => o.value === layout)?.label ?? "";
}

export const TemplateCard = memo(function TemplateCard({
  template,
  preview,
  active = false,
  onPick,
}: {
  template: BioTemplate;
  preview?: PublicBioPage;
  active?: boolean;
  onPick: (template: BioTemplate) => void;
}) {
  const sample = useMemo(() => preview ?? templatePreview(template), [preview, template]);

  return (
    <UnstyledButton
      className={classes.card}
      data-active={active || undefined}
      onClick={() => onPick(template)}
      aria-label={active ? `${template.name}, the current design` : `Use the ${template.name} template`}
    >
      <PhoneThumb page={sample} className={classes.phone} />
      <div className={classes.body}>
        <span className={classes.name}>
          {active && <Check size={14} className={classes.check} aria-hidden />}
          {template.name}
        </span>
        <span className={classes.meta}>
          {BIO_KIND_LABEL[template.kind]} · {layoutLabel(template)}
        </span>
        <span className={classes.text}>{template.description}</span>
      </div>
    </UnstyledButton>
  );
});
