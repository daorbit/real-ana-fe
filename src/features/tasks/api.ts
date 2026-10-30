import { api } from "@/app/store/api";
import type { Task, TaskPatch } from "./types";

const base = (workspaceId: string) => `/api/workspaces/${workspaceId}/tasks`;

const tasksApi = api.enhanceEndpoints({ addTagTypes: ["Task"] }).injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<Task[], string>({
      query: (workspaceId) => base(workspaceId),
      providesTags: (_r, _e, workspaceId) => [{ type: "Task", id: workspaceId }],
    }),

    createTask: build.mutation<Task, { workspaceId: string; task: TaskPatch & { title: string } }>({
      query: ({ workspaceId, task }) => ({ url: base(workspaceId), method: "POST", body: task }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          tasksApi.util.updateQueryData("getTasks", workspaceId, (draft) => {
            draft.push(data);
          }),
        );
      },
    }),

    updateTask: build.mutation<Task, { workspaceId: string; id: string; patch: TaskPatch }>({
      query: ({ workspaceId, id, patch }) => ({ url: `${base(workspaceId)}/${id}`, method: "PATCH", body: patch }),
      async onQueryStarted({ workspaceId, id, patch }, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          tasksApi.util.updateQueryData("getTasks", workspaceId, (draft) => {
            const task = draft.find((t) => t.id === id);
            if (task) Object.assign(task, patch);
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            tasksApi.util.updateQueryData("getTasks", workspaceId, (draft) => {
              const index = draft.findIndex((t) => t.id === id);
              if (index >= 0) draft[index] = data;
            }),
          );
        } catch {
          optimistic.undo();
        }
      },
    }),

    deleteTask: build.mutation<void, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => ({ url: `${base(workspaceId)}/${id}`, method: "DELETE" }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          tasksApi.util.updateQueryData("getTasks", workspaceId, (draft) => draft.filter((t) => t.id !== id)),
        );
        try {
          await queryFulfilled;
        } catch {
          optimistic.undo();
        }
      },
    }),
  }),
});

export const { useGetTasksQuery, useCreateTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } = tasksApi;
