import type { ReactNode } from "react";
import { Code2, Plus } from "lucide-react";
import { BLANK_TEMPLATE, CAMPAIGN_TEMPLATES, HTML_TEMPLATE, type CampaignTemplate } from "@/features/campaigns/lib/campaignTemplates";
import { TemplateThumb } from "./TemplateThumb";
import classes from "./Templates.module.css";

interface Props {
  disabled: boolean;
  onPick: (template: CampaignTemplate) => void;
}

function Tile({
  template,
  disabled,
  onPick,
  children,
}: {
  template: CampaignTemplate;
  disabled: boolean;
  onPick: (template: CampaignTemplate) => void;
  children: ReactNode;
}) {
  return (
    <button type="button" className={classes.tile} disabled={disabled} onClick={() => onPick(template)}>
      {children}
      <span className={classes.caption}>
        <span className={classes.name}>{template.name}</span>
        <span className={classes.blurb}>{template.blurb}</span>
      </span>
    </button>
  );
}

export function TemplateGallery({ disabled, onPick }: Props) {
  return (
    <div className={classes.gallery}>
      {CAMPAIGN_TEMPLATES.map((template) => (
        <Tile key={template.id} template={template} disabled={disabled} onPick={onPick}>
          <TemplateThumb template={template} />
        </Tile>
      ))}
      <Tile template={BLANK_TEMPLATE} disabled={disabled} onPick={onPick}>
        <span className={classes.empty}><Plus size={26} aria-hidden /></span>
      </Tile>
      <Tile template={HTML_TEMPLATE} disabled={disabled} onPick={onPick}>
        <span className={classes.empty}><Code2 size={26} aria-hidden /></span>
      </Tile>
    </div>
  );
}
