import { Button, FileButton, Textarea } from "@mantine/core";
import { Upload } from "lucide-react";
import { notify } from "@/shared/lib/notify";
import { EditorSection } from "./EditorSection";
import classes from "./Editor.module.css";

const MAX_HTML_CHARS = 100_000;

interface Props {
  html: string;
  onChange: (html: string) => void;
}

export function HtmlSection({ html, onChange }: Props) {
  const readFile = async (file: File | null) => {
    if (!file) return;
    try {
      const text = await file.text();
      if (text.length > MAX_HTML_CHARS) {
        notify.error("That file is over 100 KB. Use a smaller template.");
        return;
      }
      onChange(text);
    } catch {
      notify.error("Could not read that file.");
    }
  };

  const upload = (
    <FileButton accept=".html,.htm,text/html" onChange={(file) => void readFile(file)}>
      {(props) => (
        <Button {...props} variant="subtle" size="compact-sm" leftSection={<Upload size={14} />}>
          Upload
        </Button>
      )}
    </FileButton>
  );

  return (
    <EditorSection
      title="Your HTML"
      aside={upload}
      note="Use {{name}} for the person's name and {{unsubscribe_url}} for your unsubscribe link. Without that link, we add a footer with one. Scripts and forms are removed."
    >
      <div className={classes.panelBody}>
        <Textarea
          className={classes.code}
          aria-label="Your HTML"
          autosize
          minRows={18}
          maxRows={32}
          maxLength={MAX_HTML_CHARS}
          spellCheck={false}
          value={html}
          onChange={(e) => onChange(e.currentTarget.value)}
        />
      </div>
    </EditorSection>
  );
}
