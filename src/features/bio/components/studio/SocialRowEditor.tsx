import type { DragHandleProps } from "@/shared/ui/SortableList";
import { BIO_SOCIAL_NETWORKS } from "@/features/bio/lib/bioOptions";
import type { BioSocial } from "@/features/bio/types";
import { SocialLogo } from "../SocialLogo";
import { CONTACT_SPECS, contactDisplay, contactKind } from "@/features/bio/lib/contactLink";
import { ContactField } from "./ui/ContactField";
import { DetailField, ExpandableRow } from "./ui/ExpandableRow";
import classes from "./ui/List.module.css";

const NETWORK = Object.fromEntries(BIO_SOCIAL_NETWORKS.map((n) => [n.id, n]));

export function SocialRowEditor({
  social,
  open,
  handle,
  onToggleOpen,
  onChange,
  onRemove,
}: {
  social: BioSocial;
  open: boolean;
  handle: DragHandleProps;
  onToggleOpen: () => void;
  onChange: (patch: Partial<BioSocial>) => void;
  onRemove: () => void;
}) {
  const network = NETWORK[social.network];
  const url = social.url.replace(/^mailto:/, "");
  const contact = contactKind(social.network);
  const shown = contact ? contactDisplay(contact, url) : url;

  return (
    <ExpandableRow
      lead={<SocialLogo network={social.network} size="sm" />}
      title={social.label?.trim() || network.label}
      subtitle={shown || (contact ? CONTACT_SPECS[contact].empty : "Add the link")}
      missing={!url.trim()}
      open={open}
      handle={handle}
      onToggle={onToggleOpen}
    >
      {contact ? (
        <ContactField kind={contact} autoFocus={!url} url={url} onChange={(next) => onChange({ url: next })} />
      ) : (
        <DetailField label={`${network.label} link`}>
          <input autoFocus={!url} className={classes.input} placeholder={network.placeholder} value={url} onChange={(e) => onChange({ url: e.currentTarget.value })} />
        </DetailField>
      )}
      <DetailField label="Name (optional)">
        <input
          className={classes.input}
          placeholder="Personal, Studio, Hindi channel…"
          maxLength={40}
          value={social.label ?? ""}
          onChange={(e) => onChange({ label: e.currentTarget.value })}
        />
      </DetailField>
      <div className={classes.detailFoot}>
        <span />
        <button type="button" className={classes.deleteButton} onClick={onRemove}>
          Remove
        </button>
      </div>
    </ExpandableRow>
  );
}
