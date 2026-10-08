import { api } from "@/app/store/api";
import type { Note, NotePatch } from "@/features/notes/types";

const queries = api.enhanceEndpoints({ addTagTypes: ["Note"] }).injectEndpoints({
  endpoints: (build) => ({
    getNotes: build.query<Note[], void>({
      query: () => "/api/notes",
      providesTags: ["Note"],
    }),
  }),
});

const notesApi = queries.injectEndpoints({
  endpoints: (build) => ({
    createNote: build.mutation<Note, NotePatch>({
      query: (body) => ({ url: "/api/notes", method: "POST", body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled.catch(() => ({ data: null }));
        if (!data) return;
        dispatch(queries.util.updateQueryData("getNotes", undefined, (list) => {
          list.unshift(data);
        }));
      },
    }),

    updateNote: build.mutation<Note, NotePatch & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/api/notes/${id}`, method: "PATCH", body }),
      async onQueryStarted({ id, ...patch }, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(queries.util.updateQueryData("getNotes", undefined, (list) => {
          const note = list.find((n) => n.id === id);
          if (note) Object.assign(note, patch, { updatedAt: new Date().toISOString() });
        }));
        const { data } = await queryFulfilled.catch(() => {
          optimistic.undo();
          return { data: null };
        });
        if (!data) return;
        dispatch(queries.util.updateQueryData("getNotes", undefined, (list) => {
          const i = list.findIndex((n) => n.id === id);
          if (i >= 0) list[i] = data;
        }));
      },
    }),

    deleteNote: build.mutation<void, string>({
      query: (id) => ({ url: `/api/notes/${id}`, method: "DELETE" }),
      async onQueryStarted(id, { dispatch, queryFulfilled }) {
        const optimistic = dispatch(queries.util.updateQueryData("getNotes", undefined, (list) =>
          list.filter((n) => n.id !== id)
        ));
        await queryFulfilled.catch(() => optimistic.undo());
      },
    }),
  }),
});

export const hideNote = (id: string) =>
  queries.util.updateQueryData("getNotes", undefined, (list) => list.filter((n) => n.id !== id));

export const { useGetNotesQuery } = queries;
export const { useCreateNoteMutation, useUpdateNoteMutation, useDeleteNoteMutation } = notesApi;
