import { useMemo } from "react";
import { useGetMembersQuery } from "@/app/store";
import { demoMembersResponse } from "@/features/demo/demoWorkspace";
import type { WorkspaceMember } from "@/shared/types";

const NO_MEMBERS: WorkspaceMember[] = [];

export function useTaskMembers(workspaceId: string, demo: boolean, enabled: boolean) {
  const { data } = useGetMembersQuery(workspaceId, { skip: !workspaceId || demo || !enabled });
  return useMemo(() => {
    const members = demo ? demoMembersResponse().members : data?.members ?? NO_MEMBERS;
    return { members, byId: new Map(members.map((m) => [m.userId, m])) };
  }, [demo, data]);
}
