import { CONTACT_FIELDS, contactDisplay, toContactLink, type ContactKind } from "@/features/bio/lib/contactLink";
import { DetailField } from "./ExpandableRow";
import list from "./List.module.css";

export function ContactField({
  kind,
  url,
  autoFocus,
  onChange,
}: {
  kind: ContactKind;
  url: string;
  autoFocus?: boolean;
  onChange: (url: string) => void;
}) {
  const field = CONTACT_FIELDS[kind];

  return (
    <DetailField label={field.label}>
      <input
        autoFocus={autoFocus}
        className={list.input}
        placeholder={field.placeholder}
        inputMode={field.inputMode}
        spellCheck={false}
        value={contactDisplay(kind, url)}
        onChange={(e) => onChange(e.currentTarget.value)}
        onBlur={(e) => {
          const next = toContactLink(kind, e.currentTarget.value);
          if (next !== url) onChange(next);
        }}
      />
    </DetailField>
  );
}
