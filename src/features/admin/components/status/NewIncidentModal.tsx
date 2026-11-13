import { useState } from "react";
import { Button, Group, Modal } from "@mantine/core";
import { statusOptionsFor } from "../../status/labels";
import type { IncidentDraft } from "../../status/types";
import { IncidentFields } from "./IncidentFields";
import { UpdateFields } from "./UpdateFields";
import classes from "./Status.module.css";

const EMPTY: IncidentDraft = { title: "", impact: "minor", components: [], status: "investigating", body: "", notify: true };

export function NewIncidentModal({
  opened,
  busy,
  subscribers,
  onClose,
  onCreate,
}: {
  opened: boolean;
  busy: boolean;
  subscribers: number;
  onClose: () => void;
  onCreate: (draft: IncidentDraft) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState<IncidentDraft>(EMPTY);
  const set = (patch: Partial<IncidentDraft>) =>
    setDraft((d) => {
      const next = { ...d, ...patch };
      if (patch.impact && patch.impact !== d.impact) next.status = statusOptionsFor(patch.impact)[0].value;
      return next;
    });
  const ready = draft.title.trim().length >= 3 && draft.body.trim().length >= 3 && draft.components.length > 0;

  const submit = async () => {
    if (await onCreate({ ...draft, title: draft.title.trim(), body: draft.body.trim() })) {
      setDraft(EMPTY);
      onClose();
    }
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Open an incident" size="lg" radius="md" centered>
      <div className={classes.form}>
        <IncidentFields title={draft.title} impact={draft.impact} components={draft.components} onChange={set} />
        <div className={classes.divider} />
        <UpdateFields
          impact={draft.impact}
          status={draft.status}
          body={draft.body}
          notify={draft.notify}
          subscribers={subscribers}
          onChange={set}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={busy} disabled={!ready} onClick={() => void submit()}>
            Publish
          </Button>
        </Group>
      </div>
    </Modal>
  );
}
