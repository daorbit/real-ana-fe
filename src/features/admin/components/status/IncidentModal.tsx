import { useState } from "react";
import { Button, Group, Modal } from "@mantine/core";
import { Trash2 } from "lucide-react";
import { dateTime } from "@/shared/lib/format";
import { statusOptionsFor } from "../../status/labels";
import type { IncidentEdit, StatusIncident, UpdateDraft } from "../../status/types";
import { IncidentFields } from "./IncidentFields";
import { UpdateFields } from "./UpdateFields";
import classes from "./Status.module.css";

function sameEdit(incident: StatusIncident, edit: Required<IncidentEdit>): boolean {
  return (
    incident.title === edit.title.trim() &&
    incident.impact === edit.impact &&
    [...incident.components].sort().join() === [...edit.components].sort().join()
  );
}

export function IncidentModal({
  incident,
  subscribers,
  posting,
  editing,
  onClose,
  onPost,
  onEdit,
  onDelete,
}: {
  incident: StatusIncident;
  subscribers: number;
  posting: boolean;
  editing: boolean;
  onClose: () => void;
  onPost: (update: UpdateDraft) => Promise<boolean>;
  onEdit: (edit: IncidentEdit) => Promise<boolean>;
  onDelete: () => void;
}) {
  const [edit, setEdit] = useState<Required<IncidentEdit>>({
    title: incident.title,
    impact: incident.impact,
    components: incident.components,
  });
  const options = statusOptionsFor(edit.impact);
  const [update, setUpdate] = useState<UpdateDraft>({
    status: options.some((o) => o.value === incident.status) ? incident.status : options[0].value,
    body: "",
    notify: true,
  });

  const post = async () => {
    if (await onPost({ ...update, body: update.body.trim() })) setUpdate((u) => ({ ...u, body: "" }));
  };

  return (
    <Modal opened onClose={onClose} title={incident.title} size="lg" radius="md" centered>
      <div className={classes.form}>
        <UpdateFields
          impact={edit.impact}
          status={update.status}
          body={update.body}
          notify={update.notify}
          subscribers={subscribers}
          onChange={(patch) => setUpdate((u) => ({ ...u, ...patch }))}
        />
        <Group justify="flex-end">
          <Button loading={posting} disabled={update.body.trim().length < 3} onClick={() => void post()}>
            Post update
          </Button>
        </Group>

        <div className={classes.divider} />

        <ol className={classes.timeline}>
          {incident.updates.map((u) => (
            <li key={u.id} className={classes.entry}>
              <span className={classes.entryHead}>
                {u.statusLabel}
                <span className={classes.entryWhen}>{dateTime(u.at)}</span>
              </span>
              <span className={classes.entryBody}>{u.body}</span>
            </li>
          ))}
        </ol>

        <div className={classes.divider} />

        <IncidentFields
          title={edit.title}
          impact={edit.impact}
          components={edit.components}
          onChange={(patch) => setEdit((e) => ({ ...e, ...patch }))}
        />
        <div className={classes.formFoot}>
          <Button variant="subtle" color="red" leftSection={<Trash2 size={15} />} onClick={onDelete}>
            Delete incident
          </Button>
          <Button
            variant="default"
            loading={editing}
            disabled={sameEdit(incident, edit) || edit.title.trim().length < 3 || !edit.components.length}
            onClick={() => void onEdit({ ...edit, title: edit.title.trim() })}
          >
            Save details
          </Button>
        </div>
      </div>
    </Modal>
  );
}
