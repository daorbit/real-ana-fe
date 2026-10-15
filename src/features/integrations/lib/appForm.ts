import type { AppField, FormsApp } from "../types";

export type FieldValue = string | number | boolean;
export type FieldValues = Record<string, FieldValue>;

function storedValue(app: FormsApp, field: AppField): FieldValue {
  const stored = app.config[field.key];
  if (field.type === "boolean") return stored === true || (stored === undefined && field.default === true);
  if (field.type === "number") return typeof stored === "number" ? stored : Number(field.default ?? 0);
  return String(stored ?? field.default ?? "");
}

export function initialValues(app: FormsApp): FieldValues {
  const out: FieldValues = {};
  for (const field of app.fields) out[field.key] = field.secret ? "" : storedValue(app, field);
  return out;
}

export function isDirty(app: FormsApp, values: FieldValues): boolean {
  return app.fields.some((field) => {
    const value = values[field.key];
    if (field.secret) return typeof value === "string" && value.trim() !== "";
    return value !== storedValue(app, field);
  });
}

export function payloadValues(app: FormsApp, values: FieldValues): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of app.fields) {
    const value = values[field.key];
    if (!field.secret) out[field.key] = value;
    else if (typeof value === "string" && value.trim() !== "") out[field.key] = value.trim();
  }
  return out;
}

export function missingRequired(app: FormsApp, values: FieldValues): AppField | undefined {
  return app.fields.find((field) => {
    if (!field.required || field.type === "boolean") return false;
    if (field.secret && app.secrets[field.key]) return false;
    const value = values[field.key];
    return typeof value === "string" ? value.trim() === "" : value === undefined;
  });
}
