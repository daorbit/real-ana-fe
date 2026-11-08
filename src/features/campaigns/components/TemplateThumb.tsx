import type { CampaignTemplate, TemplateTone } from "@/features/campaigns/lib/campaignTemplates";
import type { EmailBlockDraft } from "@/features/campaigns/types";
import classes from "./Templates.module.css";

function ThumbBlockView({ block: value }: { block: EmailBlockDraft }) {
  switch (value.type) {
    case "brand":
      return <div className={classes.brand} data-align={value.align}>Your brand</div>;
    case "heading":
      return <div className={classes.heading} data-size={value.size} data-align={value.align}>{value.text}</div>;
    case "text":
      return <div className={classes.text} data-align={value.align}>{value.text.replace(/\{\{\s*name\s*\}\}/g, "Maya")}</div>;
    case "image":
      return <div className={classes.image} />;
    case "button":
      return (
        <div className={classes.buttonRow} data-align={value.align}>
          <span className={classes.button} data-full={value.fullWidth || undefined}>{value.label}</span>
        </div>
      );
    case "divider":
      return <div className={classes.divider} />;
    case "columns":
      return (
        <div className={classes.columns}>
          <span><b>{value.leftTitle}</b>{value.leftText}</span>
          <span><b>{value.rightTitle}</b>{value.rightText}</span>
        </div>
      );
    default:
      return null;
  }
}

export function EmailThumb({
  tone,
  blocks,
  className,
}: {
  tone: TemplateTone;
  blocks: EmailBlockDraft[];
  className?: string;
}) {
  return (
    <span className={className ? `${classes.paper} ${className}` : classes.paper} data-tone={tone} aria-hidden>
      {blocks.map((block, index) => (
        <ThumbBlockView key={index} block={block} />
      ))}
    </span>
  );
}

export function TemplateThumb({ template }: { template: CampaignTemplate }) {
  return <EmailThumb tone={template.tone} blocks={template.blocks} />;
}
