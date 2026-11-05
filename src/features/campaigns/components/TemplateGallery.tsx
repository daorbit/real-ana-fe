import { Code2, Plus } from "lucide-react";
import { BLANK_TEMPLATE, CAMPAIGN_TEMPLATES, HTML_TEMPLATE, type CampaignTemplate } from "@/features/campaigns/lib/campaignTemplates";
import { TemplateThumb } from "./TemplateThumb";
import classes from "./Templates.module.css";

interface Props {
  disabled: boolean;
  onPick: (template: CampaignTemplate) => void;
}

export function TemplateGallery({ disabled, onPick }: Props) {
  return (
    <div className={classes.gallery}>
      {CAMPAIGN_TEMPLATES.map((template) => (
        <button key={template.id} type="button" className={classes.tile} disabled={disabled} onClick={() => onPick(template)}>
          <TemplateThumb template={template} />
          <span className={classes.name}>{template.name}</span>
        </button>
      ))}
      <button type="button" className={classes.tile} disabled={disabled} onClick={() => onPick(BLANK_TEMPLATE)}>
        <span className={classes.empty}><Plus size={26} aria-hidden /></span>
        <span className={classes.name}>Blank</span>
      </button>
      <button type="button" className={classes.tile} disabled={disabled} onClick={() => onPick(HTML_TEMPLATE)}>
        <span className={classes.empty}><Code2 size={26} aria-hidden /></span>
        <span className={classes.name}>Custom HTML</span>
      </button>
    </div>
  );
}
