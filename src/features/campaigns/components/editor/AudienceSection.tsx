import { useEffect, useMemo, useRef, useState } from "react";
import { Button, FileButton, MultiSelect, Textarea } from "@mantine/core";
import { Upload } from "lucide-react";
import { notify } from "@/shared/lib/notify";
import { contactsToText, parseContacts } from "@/features/campaigns/lib/parseContacts";
import type { CampaignInput, CampaignSources } from "@/features/campaigns/types";
import { EditorSection } from "./EditorSection";
import classes from "./Editor.module.css";

interface Props {
  draft: CampaignInput;
  sources: CampaignSources | undefined;
  onChange: <K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) => void;
}

export function AudienceSection({ draft, sources, onChange }: Props) {
  const [pasted, setPasted] = useState("");
  const parsed = useMemo(() => parseContacts(pasted), [pasted]);
  const options = useMemo(
    () => (sources?.forms ?? []).map((form) => ({ value: form.id, label: `${form.title} (${form.responses.toLocaleString()})` })),
    [sources],
  );
  const edited = useRef(false);

  useEffect(() => {
    if (!edited.current) setPasted(contactsToText(draft.imported));
  }, [draft.imported]);

  const applyText = (text: string) => {
    edited.current = true;
    setPasted(text);
    onChange("imported", parseContacts(text).contacts);
  };

  const readFile = async (file: File | null) => {
    if (!file) return;
    try {
      applyText(await file.text());
    } catch {
      notify.error("Could not read that file.");
    }
  };

  return (
    <EditorSection title="Who gets this" note="Repeated and unsubscribed addresses are removed before sending.">
      <div className={classes.panelBody}>
        <MultiSelect
          label="People who answered these forms"
          placeholder={options.length ? "Choose forms" : "No forms collect an email address yet"}
          data={options}
          value={draft.formIds}
          disabled={!options.length}
          searchable
          onChange={(value) => onChange("formIds", value)}
        />
        <Textarea
          label="Add your own contacts"
          description="One per line: email, name. Up to 5,000."
          placeholder={"maya@example.com, Maya\nsam@example.com"}
          autosize
          minRows={3}
          maxRows={8}
          value={pasted}
          onChange={(e) => applyText(e.currentTarget.value)}
        />
        <div className={classes.importActions}>
          <FileButton accept=".csv,.txt,text/csv,text/plain" onChange={(file) => void readFile(file)}>
            {(props) => (
              <Button {...props} variant="default" size="xs" leftSection={<Upload size={14} />}>
                Upload CSV
              </Button>
            )}
          </FileButton>
          <span className={classes.count}>
            {parsed.contacts.length.toLocaleString()} added{parsed.skipped ? ` · ${parsed.skipped} skipped` : ""}
          </span>
        </div>
      </div>
    </EditorSection>
  );
}
