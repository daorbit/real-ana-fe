import { NumberInput, PasswordInput, Switch, TextInput } from "@mantine/core";
import type { AppField } from "../types";
import type { FieldValue } from "../lib/appForm";

interface Props {
  field: AppField;
  value: FieldValue;
  savedSecret?: string;
  onChange: (value: FieldValue) => void;
}

export function AppFieldInput({ field, value, savedSecret, onChange }: Props) {
  if (field.type === "boolean") {
    return (
      <Switch
        label={field.label}
        description={field.help}
        checked={Boolean(value)}
        onChange={(e) => onChange(e.currentTarget.checked)}
      />
    );
  }

  if (field.type === "number") {
    return (
      <NumberInput
        label={field.label}
        description={field.help}
        placeholder={field.placeholder}
        required={field.required}
        value={value as number}
        onChange={(next) => onChange(typeof next === "number" ? next : Number(next) || 0)}
      />
    );
  }

  if (field.secret) {
    return (
      <PasswordInput
        label={field.label}
        description={savedSecret ? `Saved as ${savedSecret}. Leave blank to keep it.` : field.help}
        required={field.required && !savedSecret}
        placeholder={savedSecret ? "••••••••" : field.placeholder}
        value={value as string}
        autoComplete="new-password"
        onChange={(e) => onChange(e.currentTarget.value)}
      />
    );
  }

  return (
    <TextInput
      label={field.label}
      description={field.help}
      placeholder={field.placeholder}
      required={field.required}
      type={field.type === "email" ? "email" : "text"}
      value={value as string}
      onChange={(e) => onChange(e.currentTarget.value)}
    />
  );
}
