import { useDemo } from "@/features/demo/context";
import { notify, notifyError } from "@/shared/lib/notify";
import { useAddRadarNoteMutation, useRecordRadarActionMutation, useUpdateRadarOpportunityMutation } from "../api";
import type { ActionDraft, OpportunityPatch } from "../types";

const DEMO_MESSAGE = "Turn off demo data to make changes.";

export function useOpportunityActions(workspaceId: string, id: string) {
  const { demo } = useDemo();
  const [update, updateState] = useUpdateRadarOpportunityMutation();
  const [addNote, noteState] = useAddRadarNoteMutation();
  const [record, recordState] = useRecordRadarActionMutation();

  const run = async (work: () => Promise<unknown>, success: string, failure: string): Promise<boolean> => {
    if (demo) {
      notify.error(DEMO_MESSAGE);
      return false;
    }
    try {
      await work();
      notify.success(success);
      return true;
    } catch (e) {
      notifyError(e, failure);
      return false;
    }
  };

  return {
    busy: updateState.isLoading,
    noting: noteState.isLoading,
    recording: recordState.isLoading,
    patch: (patch: OpportunityPatch, success: string) =>
      run(() => update({ workspaceId, id, patch }).unwrap(), success, "Could not update this finding."),
    note: (text: string) => run(() => addNote({ workspaceId, id, text }).unwrap(), "Note added", "Could not add the note."),
    recordAction: (action: ActionDraft) =>
      run(() => record({ workspaceId, id, action }).unwrap(), "Action recorded. Growth Radar will compare the results.", "Could not record the action."),
  };
}
