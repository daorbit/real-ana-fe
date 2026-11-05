import { Group, TextInput, Textarea } from "@mantine/core";
import type { CampaignInput } from "@/features/campaigns/types";
import classes from "../Campaigns.module.css";
import { EditorSection } from "./EditorSection";

interface Props {
  draft: CampaignInput;
  onChange: <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => void;
}

export function ContentSection({ draft, onChange }: Props) {
  return (
    <EditorSection title="Email" text="Write {{name}} to use each person's name. It becomes “there” when a name is missing.">
      <TextInput
        label="Campaign name"
        description="Only you see this."
        placeholder="Spring product launch"
        required
        maxLength={120}
        value={draft.name}
        onChange={(e) => onChange("name", e.currentTarget.value)}
      />
      <TextInput
        label="Subject"
        placeholder="Our new plans are here"
        maxLength={200}
        value={draft.subject}
        onChange={(e) => onChange("subject", e.currentTarget.value)}
      />
      <Textarea
        label="Message"
        description="Leave a blank line between paragraphs. Links become clickable."
        autosize
        minRows={8}
        maxRows={20}
        value={draft.body}
        onChange={(e) => onChange("body", e.currentTarget.value)}
      />
      <Group grow align="flex-start">
        <TextInput
          className={classes.grow}
          label="Button text"
          placeholder="See the plans"
          maxLength={40}
          value={draft.ctaLabel}
          onChange={(e) => onChange("ctaLabel", e.currentTarget.value)}
        />
        <TextInput
          className={classes.grow}
          label="Button link"
          placeholder="https://"
          maxLength={500}
          value={draft.ctaUrl}
          onChange={(e) => onChange("ctaUrl", e.currentTarget.value)}
        />
      </Group>
      <TextInput
        label="Business postal address"
        description="Shown in the footer. Many email laws ask for it on marketing emails."
        placeholder="12 Market Street, Bengaluru"
        maxLength={300}
        value={draft.senderAddress}
        onChange={(e) => onChange("senderAddress", e.currentTarget.value)}
      />
    </EditorSection>
  );
}
