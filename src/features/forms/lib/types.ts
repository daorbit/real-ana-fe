/**
 * The form builder's vocabulary, mirroring `modules/forms/models/Form.ts`.
 *
 * Kept beside the feature rather than in `shared/types` because nothing outside
 * forms speaks it — the one piece the rest of the app needs (plan limits) lives
 * on `QuotaSummary` instead.
 */

export const FIELD_TYPES = [
  "text",
  "email",
  "tel",
  "textarea",
  "select",
  "checkbox",
  "radio",
  "number",
] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

/** Types whose answer is chosen from `options` rather than typed. */
export const CHOICE_TYPES: FieldType[] = ["select", "radio"];

export type FormStatus = "draft" | "published" | "closed";

/**
 * Row widths, in twelfths: a third, a half, or the full row.
 *
 * Layout is a property of the field rather than a `rows[]` wrapper, so
 * `fields[]` stays the single ordered list that reordering, key immutability
 * and the CSV columns all read. Rows are implicit — consecutive fields pack
 * left to right until they would exceed twelve, then wrap.
 */
export const FIELD_WIDTHS = [4, 6, 12] as const;
export type FieldWidth = (typeof FIELD_WIDTHS)[number];

export type FormField = {
  /**
   * The stable machine key answers are stored under.
   *
   * Generated once from the first label and then left alone. Once the form has
   * submissions the server refuses to change it, because renaming a key orphans
   * every stored answer under it.
   */
  key: string;
  label: string;
  type: FieldType;
  /** Shown under the input. Zoho calls this "Instructions". */
  help: string;
  placeholder: string;
  required: boolean;
  /** select/radio only. */
  options: string[];
  maxLength: number;
  order: number;
  /** A field retired after the form had submissions: no longer rendered, answers kept. */
  hidden: boolean;
  width: FieldWidth;
};

export type FormSettings = {
  submitText: string;
  successMessage: string;
  /** Overrides `successMessage` when set. */
  redirectUrl: string;
  notifyEmails: string[];
  dedupFieldKey: string;
  dedupAction: "allow" | "replace" | "reject";
  captchaEnabled: boolean;
  logoUrl: string;
  primaryColor: string;
  closedMessage: string;
};

export type Form = {
  id: string;
  workspaceId: string;
  siteId: string | null;
  name: string;
  /** The public key in the hosted URL, `frm_…`. Never the Mongo id. */
  formKey: string;
  status: FormStatus;
  fields: FormField[];
  settings: FormSettings;
  submissionCount: number;
  lastSubmissionAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Submission = {
  id: string;
  data: Record<string, unknown>;
  referrer: string;
  utm: { source?: string; medium?: string; campaign?: string };
  /** Captured while the workspace was over quota — stored, but not notified on. */
  overQuota: boolean;
  /** Arrived while the form was above its hourly ceiling. */
  flagged: boolean;
  flagReason: string;
  createdAt: string;
};

export type SubmissionPage = {
  submissions: Submission[];
  total: number;
  page: number;
  limit: number;
  /** Sent with the page so the table can render a column per field, retired ones included. */
  fields: FormField[];
};

/**
 * One entry in the builder's left rail.
 *
 * Grouped the way a person shopping for a field thinks about it — "I need to
 * ask for an email address" — rather than by the input element underneath.
 */
export type PaletteEntry = {
  type: FieldType;
  label: string;
  /** The label a newly dropped field starts with. */
  defaultLabel: string;
  group: string;
  /** Seeded for choice fields, so a new dropdown is never empty and unsavable. */
  defaultOptions?: string[];
  defaultWidth?: FieldWidth;
};

export const FIELD_PALETTE: PaletteEntry[] = [
  { type: "text", label: "Single line", defaultLabel: "Single line", group: "Text" },
  { type: "textarea", label: "Multi line", defaultLabel: "Message", group: "Text", defaultWidth: 12 },
  { type: "email", label: "Email", defaultLabel: "Email", group: "Basic info" },
  { type: "tel", label: "Phone", defaultLabel: "Phone", group: "Basic info" },
  { type: "number", label: "Number", defaultLabel: "Number", group: "Number" },
  {
    type: "select",
    label: "Dropdown",
    defaultLabel: "Choose one",
    group: "Choices",
    defaultOptions: ["First choice", "Second choice"],
  },
  {
    type: "radio",
    label: "Radio",
    defaultLabel: "Pick one",
    group: "Choices",
    defaultOptions: ["First choice", "Second choice"],
  },
  { type: "checkbox", label: "Checkbox", defaultLabel: "I agree", group: "Choices", defaultWidth: 12 },
];

/** Palette groups in rail order. Derived so a new entry cannot be left out of the rail. */
export const PALETTE_GROUPS = [...new Set(FIELD_PALETTE.map((e) => e.group))];

/**
 * A machine key from a label — lowercase, underscores, never leading with a
 * digit. Mirrors `slugifyFieldKey` server-side.
 *
 * Called once when a field is added. Deliberately not re-run on a label edit:
 * regenerating a key that already has answers stored under it is precisely the
 * bug key immutability exists to prevent.
 */
export function slugifyFieldKey(label: string): string {
  const base = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 60);
  if (!base) return "field";
  return /^[0-9]/.test(base) ? `f_${base}` : base;
}

/** A key that does not collide with anything already on the form. */
export function uniqueFieldKey(label: string, taken: string[]): string {
  const base = slugifyFieldKey(label);
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base}_${n}`)) n += 1;
  return `${base}_${n}`;
}

/** A new field of this palette type, ready to append. */
export function makeField(entry: PaletteEntry, taken: string[], order: number): FormField {
  return {
    key: uniqueFieldKey(entry.defaultLabel, taken),
    label: entry.defaultLabel,
    type: entry.type,
    help: "",
    placeholder: "",
    required: false,
    options: entry.defaultOptions ?? [],
    maxLength: entry.type === "textarea" ? 2000 : 500,
    order,
    hidden: false,
    width: entry.defaultWidth ?? 12,
  };
}

/**
 * Pack fields into rows of twelve for the canvas and the preview.
 *
 * The single place the implicit-row rule is interpreted, so the builder canvas
 * and the read-only preview cannot drift into laying the same form out
 * differently.
 */
export function packRows(fields: FormField[]): FormField[][] {
  const rows: FormField[][] = [];
  let row: FormField[] = [];
  let used = 0;

  for (const field of fields) {
    const width = field.type === "textarea" ? 12 : field.width;
    if (used + width > 12 && row.length) {
      rows.push(row);
      row = [];
      used = 0;
    }
    row.push(field);
    used += width;
  }
  if (row.length) rows.push(row);
  return rows;
}
