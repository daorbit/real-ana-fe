import { Select, Switch, Textarea } from "@mantine/core";
import { statusOptionsFor } from "../../status/labels";
import type { IncidentImpact, IncidentStatus } from "../../status/types";

export function UpdateFields({
  impact,
  status,
  body,
  notify,
  subscribers,
  onChange,
}: {
  impact: IncidentImpact;
  status: IncidentStatus;
  body: string;
  notify: boolean;
  subscribers: number;
  onChange: (patch: { status?: IncidentStatus; body?: string; notify?: boolean }) => void;
}) {
  return (
    <>
      <Select
        label="Status"
        data={statusOptionsFor(impact)}
        value={status}
        allowDeselect={false}
        onChange={(value) => value && onChange({ status: value as IncidentStatus })}
      />
      <Textarea
        label="Message"
        description="Shown on the public status page. Say what people see and what you are doing, in plain words."
        placeholder="We are looking into slow page loads on the dashboard."
        autosize
        minRows={3}
        maxRows={10}
        maxLength={5000}
        value={body}
        onChange={(e) => onChange({ body: e.currentTarget.value })}
      />
      <Switch
        checked={notify}
        onChange={(e) => onChange({ notify: e.currentTarget.checked })}
        label={`Email subscribers (${subscribers.toLocaleString()})`}
      />
    </>
  );
}
