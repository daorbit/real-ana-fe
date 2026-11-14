import { useState } from "react";
import {
  CONTACT_SPECS, handleDisplay, handleLink, initialMode, type ContactKind, type ContactMode,
} from "@/features/bio/lib/contactLink";
import { ContactNumber } from "./ContactNumber";
import { Segmented } from "./Segmented";
import list from "./List.module.css";
import classes from "./ContactField.module.css";

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
  const spec = CONTACT_SPECS[kind];
  const [mode, setMode] = useState<ContactMode>(() => initialMode(kind, url));

  const switchMode = (next: ContactMode) => {
    if (next === mode) return;
    setMode(next);
    onChange("");
  };

  return (
    <div className={list.field}>
      <div className={classes.head}>
        <span className={list.fieldLabel}>{spec.name}</span>
        <Segmented size="sm" label={`${spec.name} contact type`} value={mode} options={spec.modes} onChange={switchMode} />
      </div>
      {mode === "number" ? (
        <ContactNumber kind={kind} url={url} autoFocus={autoFocus} onChange={onChange} />
      ) : (
        <input
          autoFocus={autoFocus}
          className={list.input}
          placeholder={spec.handlePlaceholder}
          spellCheck={false}
          value={handleDisplay(kind, url)}
          onChange={(e) => onChange(e.currentTarget.value)}
          onBlur={(e) => {
            const next = handleLink(kind, e.currentTarget.value);
            if (next !== url) onChange(next);
          }}
        />
      )}
    </div>
  );
}
