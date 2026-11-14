import { useCreateBioPageMutation, useDeleteBioPageMutation, useUpdateBioPageMutation } from "@/features/bio/api";
import type { BioPage, BioPageInput } from "@/features/bio/types";

export function useBioMutations(workspaceId: string | undefined) {
  const [createPage, { isLoading: creating }] = useCreateBioPageMutation();
  const [updatePage, { isLoading: updating }] = useUpdateBioPageMutation();
  const [deletePage, { isLoading: deleting }] = useDeleteBioPageMutation();

  return {
    create: (input: BioPageInput): Promise<BioPage> => createPage({ workspaceId: workspaceId!, ...input }).unwrap(),
    update: (id: string, input: BioPageInput): Promise<BioPage> => updatePage({ workspaceId: workspaceId!, id, ...input }).unwrap(),
    remove: (id: string): Promise<void> => deletePage({ workspaceId: workspaceId!, id }).unwrap(),
    pending: creating || updating || deleting,
  };
}
