import { api } from "@/app/store/api";
import type { Bucket, Task, TaskPatch, TasksResponse } from "./types";

const base = (workspaceId: string) => `/api/workspaces/${workspaceId}/tasks`;

const tasksApi = api.enhanceEndpoints({ addTagTypes: ["Task"] }).injectEndpoints({
  endpoints: (build) => ({
    getTasks: build.query<TasksResponse, string>({
      query: (workspaceId) => base(workspaceId),
      providesTags: (_r, _e, workspaceId) => [{ type: "Task", id: workspaceId }],
    }),

    createTask: build.mutation<Task, { workspaceId: string; task: TaskPatch & { title: string } }>({
      query: ({ workspaceId, task }) => ({ url: base(workspaceId), method: "POST", body: task }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          tasksApi.util.updateQueryData("getTasks", workspaceId, (draft) => {
            draft.tasks.push(data);
          }),
        );
      },
    }),

    updateTask: build.mutation<Task, { workspaceId: string; id: string; patch: TaskPatch }>({
      query: ({ workspaceId, id, patch }) => ({ url: `${base(workspaceId)}/${id}`, method: "PATCH", body: patch }),
      async onQueryStarted({ workspaceId, id, patch }, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          tasksApi.util.updateQueryData("getTasks", workspaceId, (draft) => {
            const task = draft.tasks.find((t) => t.id === id);
            if (task) Object.assign(task, patch);
          }),
        );
        try {
          const { data } = await queryFulfilled;
          dispatch(
            tasksApi.util.updateQueryData("getTasks", workspaceId, (draft) => {
              const index = draft.tasks.findIndex((t) => t.id === id);
              if (index >= 0) draft.tasks[index] = data;
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
          tasksApi.util.updateQueryData("getTasks", workspaceId, (draft) => {
            draft.tasks = draft.tasks.filter((t) => t.id !== id);
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          optimistic.undo();
        }
      },
    }),

    createBucket: build.mutation<Bucket, { workspaceId: string; name: string }>({
      query: ({ workspaceId, name }) => ({ url: `${base(workspaceId)}/buckets`, method: "POST", body: { name } }),
      async onQueryStarted({ workspaceId }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          tasksApi.util.updateQueryData("getTasks", workspaceId, (draft) => {
            draft.buckets.push(data);
          }),
        );
      },
    }),

    renameBucket: build.mutation<Bucket, { workspaceId: string; id: string; name: string }>({
      query: ({ workspaceId, id, name }) => ({ url: `${base(workspaceId)}/buckets/${id}`, method: "PATCH", body: { name } }),
      async onQueryStarted({ workspaceId, id, name }, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(
          tasksApi.util.updateQueryData("getTasks", workspaceId, (draft) => {
            const bucket = draft.buckets.find((b) => b.id === id);
            if (bucket) bucket.name = name;
          }),
        );
        try {
          await queryFulfilled;
        } catch {
          optimistic.undo();
        }
      },
    }),

    deleteBucket: build.mutation<{ movedTo: string }, { workspaceId: string; id: string }>({
      query: ({ workspaceId, id }) => ({ url: `${base(workspaceId)}/buckets/${id}`, method: "DELETE" }),
      async onQueryStarted({ workspaceId, id }, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(
          tasksApi.util.updateQueryData("getTasks", workspaceId, (draft) => {
            draft.buckets = draft.buckets.filter((b) => b.id !== id);
            for (const task of draft.tasks) if (task.bucketId === id) task.bucketId = data.movedTo;
          }),
        );
      },
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useCreateBucketMutation,
  useRenameBucketMutation,
  useDeleteBucketMutation,
} = tasksApi;
