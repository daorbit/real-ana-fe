import { useState } from "react";
import { Button, Textarea } from "@mantine/core";
import { timeAgo } from "@/shared/lib/format";
import { SECTION_HELP } from "../../lib/help";
import type { OpportunityDetail } from "../../types";
import { Panel } from "./Panel";
import classes from "../Opportunity.module.css";

const MAX_NOTE = 1000;

export function RadarNotes({
  notes,
  canEdit,
  busy,
  onAdd,
}: {
  notes: OpportunityDetail["notes"];
  canEdit: boolean;
  busy: boolean;
  onAdd: (text: string) => Promise<boolean>;
}) {
  const [text, setText] = useState("");

  const submit = async () => {
    if (!text.trim()) return;
    if (await onAdd(text.trim())) setText("");
  };

  return (
    <Panel id="radar-notes" title="Notes" help={SECTION_HELP.notes}>
      {canEdit && (
        <div className={classes.noteForm}>
          <Textarea
            w="100%"
            aria-label="New note"
            placeholder="What did you find, or decide?"
            autosize
            minRows={2}
            maxRows={6}
            maxLength={MAX_NOTE}
            value={text}
            onChange={(e) => setText(e.currentTarget.value)}
          />
          <Button variant="default" size="xs" loading={busy} disabled={!text.trim()} onClick={() => void submit()}>
            Add note
          </Button>
        </div>
      )}
      {notes.length ? (
        <div className={classes.notes}>
          {notes.map((note) => (
            <div key={note.id} className={classes.note}>
              <span className={classes.noteText}>{note.text}</span>
              <span className={classes.byline}>
                {note.author?.name ?? "Someone"} · {timeAgo(note.at)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        !canEdit && <p className={classes.panelHint}>No notes yet.</p>
      )}
    </Panel>
  );
}
