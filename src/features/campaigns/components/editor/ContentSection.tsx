import type { CampaignInput, CampaignSources } from "@/features/campaigns/types";
import { EditorSection } from "./EditorSection";
import classes from "./Editor.module.css";

interface Props {
  draft: CampaignInput;
  sources: CampaignSources | undefined;
  onChange: <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => void;
}

export function ContentSection({ draft, sources, onChange }: Props) {
  const delivery = sources?.delivery;
  return (
    <EditorSection title="Details">
      <div className={classes.field}>
        <span className={classes.fieldLabel}>From</span>
        <span className={classes.fieldValue}>
          {delivery?.connected ? `${delivery.fromEmail || delivery.providerName} · ${delivery.providerName}` : "No email provider active"}
        </span>
      </div>
      <div className={classes.field}>
        <label className={classes.fieldLabel} htmlFor="campaign-subject">Subject</label>
        <input
          id="campaign-subject"
          className={classes.fieldInput}
          placeholder="What is this email about?"
          maxLength={200}
          value={draft.subject}
          onChange={(e) => onChange("subject", e.currentTarget.value)}
        />
      </div>
      <div className={classes.field}>
        <label className={classes.fieldLabel} htmlFor="campaign-preheader">Preview</label>
        <input
          id="campaign-preheader"
          className={classes.fieldInput}
          placeholder="The line people see after the subject"
          maxLength={200}
          value={draft.preheader}
          onChange={(e) => onChange("preheader", e.currentTarget.value)}
        />
      </div>
      <div className={classes.field}>
        <label className={classes.fieldLabel} htmlFor="campaign-address">Address</label>
        <input
          id="campaign-address"
          className={classes.fieldInput}
          placeholder="Your business address, shown in the footer"
          maxLength={300}
          value={draft.senderAddress}
          onChange={(e) => onChange("senderAddress", e.currentTarget.value)}
        />
      </div>
    </EditorSection>
  );
}
