import type { CampaignTemplate } from "@/features/campaigns/lib/campaignTemplates";
import type { EmailBlock } from "@/features/campaigns/types";
import classes from "./Templates.module.css";

type ThumbBlock = Omit<EmailBlock, "id">;

function ThumbBlockView({ block }: { block: ThumbBlock }) {
  const value = block as EmailBlock;
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

export function TemplateThumb({ template }: { template: CampaignTemplate }) {
  return (
    <span className={classes.paper} data-tone={template.tone}>
      {template.blocks.map((block, index) => (
        <ThumbBlockView key={index} block={block} />
      ))}
    </span>
  );
}
