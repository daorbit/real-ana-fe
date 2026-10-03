export type NoteColor = "default" | "amber" | "emerald" | "sky" | "rose" | "violet";

export type Note = {
  id: string;
  title: string;
  body: string;
  color: NoteColor;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NotePatch = Partial<Pick<Note, "title" | "body" | "color" | "pinned">>;

export const NOTE_COLORS: { value: NoteColor; label: string }[] = [
  { value: "default", label: "Graphite" },
  { value: "amber", label: "Amber" },
  { value: "emerald", label: "Emerald" },
  { value: "sky", label: "Sky" },
  { value: "rose", label: "Rose" },
  { value: "violet", label: "Violet" },
];
