import { notify, notifyError, confirmDelete } from "@/shared/lib/notify";
import { useCreateBucketMutation, useDeleteBucketMutation, useUpdateBucketMutation } from "../api";
import type { Bucket } from "../types";

export function useBucketActions(workspaceId: string, buckets: Bucket[], demo: boolean) {
  const [createBucket, { isLoading: adding }] = useCreateBucketMutation();
  const [updateBucket] = useUpdateBucketMutation();
  const [deleteBucket] = useDeleteBucketMutation();
  const blocked = () => notify.error("Turn off demo data to make changes.");

  const add = async (name: string): Promise<boolean> => {
    if (demo) {
      blocked();
      return false;
    }
    try {
      await createBucket({ workspaceId, name }).unwrap();
      return true;
    } catch (e) {
      notifyError(e, "Could not add the bucket");
      return false;
    }
  };

  const rename = async (bucket: Bucket, name: string) => {
    if (demo) return blocked();
    try {
      await updateBucket({ workspaceId, id: bucket.id, update: { name } }).unwrap();
    } catch (e) {
      notifyError(e, "Could not rename the bucket");
    }
  };

  const setLimit = async (bucket: Bucket, limit: number | null) => {
    if (demo) return blocked();
    try {
      await updateBucket({ workspaceId, id: bucket.id, update: { limit } }).unwrap();
    } catch (e) {
      notifyError(e, "Could not set the limit");
    }
  };

  const remove = (bucket: Bucket) => {
    if (demo) return blocked();
    const target = buckets.find((b) => b.id !== bucket.id);
    confirmDelete({
      title: `Delete “${bucket.name}”?`,
      body: `Its tasks move to “${target?.name ?? "another bucket"}”. Nothing is deleted except the bucket.`,
      confirmLabel: "Delete bucket",
      onConfirm: async () => {
        try {
          await deleteBucket({ workspaceId, id: bucket.id }).unwrap();
          notify.success("Bucket deleted");
        } catch (e) {
          notifyError(e, "Could not delete the bucket");
        }
      },
    });
  };

  return { add, adding, rename, setLimit, remove };
}
