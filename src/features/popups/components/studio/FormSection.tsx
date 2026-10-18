import { useMemo } from "react";
import { Anchor, Group, Select, Text, TextInput } from "@mantine/core";
import { Link } from "react-router-dom";
import { skipToken } from "@reduxjs/toolkit/query";
import { useDemo } from "@/features/demo/context";
import { useGetPublishedFormsQuery } from "@/features/popups/api";
import type { PopupInput } from "@/features/popups/types";
import type { Site } from "@/shared/types";
import { StudioSection } from "@/features/popups/components/studio/StudioSection";
import classes from "@/features/popups/components/studio/PopupStudio.module.css";

export function FormSection({
  workspaceId,
  draft,
  sites,
  onChange,
}: {
  workspaceId: string;
  draft: PopupInput;
  sites: Site[];
  onChange: (patch: Partial<PopupInput>) => void;
}) {
  const { demo } = useDemo();
  const forms = useGetPublishedFormsQuery(demo ? skipToken : workspaceId);

  const formOptions = useMemo(() => {
    const options = (forms.data ?? []).map((f) => ({ value: f._id, label: f.title || f.name || "Untitled form" }));
    if (draft.formId && !options.some((o) => o.value === draft.formId)) {
      options.unshift({ value: draft.formId, label: draft.formTitle || "Current form" });
    }
    return options;
  }, [forms.data, draft.formId, draft.formTitle]);

  const done = Boolean(draft.name.trim() && draft.siteId && draft.formId);

  return (
    <StudioSection step={1} title="Form and site" description="Which form to show, and on which of your sites." done={done}>
      <TextInput
        label="Popup name"
        description="Only you see this. It helps you tell popups apart."
        placeholder="Exit offer on pricing"
        maxLength={80}
        value={draft.name}
        onChange={(e) => onChange({ name: e.currentTarget.value })}
      />
      <Group grow align="flex-start">
        <Select
          label="Site"
          data={sites.map((s) => ({ value: s.siteId, label: s.name }))}
          value={draft.siteId || null}
          allowDeselect={false}
          onChange={(v) => onChange({ siteId: v ?? "" })}
        />
        <Select
          label="Form"
          placeholder={forms.isFetching ? "Loading forms…" : "Pick a published form"}
          data={formOptions}
          value={draft.formId || null}
          searchable
          nothingFoundMessage="No published forms match"
          onChange={(v) => onChange({ formId: v ?? "", formTitle: formOptions.find((o) => o.value === v)?.label ?? "" })}
        />
      </Group>
      {!forms.isFetching && formOptions.length === 0 && (
        <Text className={classes.hint}>
          You have no published forms yet.{" "}
          <Anchor component={Link} to="/app/lead-capture" size="xs">
            Create one in Lead capture
          </Anchor>
          , then pick it here.
        </Text>
      )}
    </StudioSection>
  );
}
