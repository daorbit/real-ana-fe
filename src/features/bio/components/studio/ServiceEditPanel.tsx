import { useState } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { BIO_ACTIONS, CUSTOM_SERVICE_ID, serviceById } from "@/features/bio/lib/serviceCatalog";
import { contactKind } from "@/features/bio/lib/contactLink";
import type { BioServiceRow } from "@/features/bio/types";
import { ServiceLogo } from "../ServiceLogo";
import { DetailField } from "./ui/ExpandableRow";
import { ServicePickerList } from "./ui/ServicePickerList";
import { Toggle } from "./ui/Toggle";
import { ContactField } from "./ui/ContactField";
import list from "./ui/List.module.css";
import classes from "./ui/Tiles.module.css";

const QUICK_ACTIONS = BIO_ACTIONS.slice(0, 7);

export function ServiceEditPanel({
  row,
  onChange,
  onRemove,
}: {
  row: BioServiceRow;
  onChange: (patch: Partial<BioServiceRow>) => void;
  onRemove: () => void;
}) {
  const [changing, setChanging] = useState(false);
  const custom = row.service === CUSTOM_SERVICE_ID;
  const contact = contactKind(row.service);

  if (changing) {
    return (
      <div className={classes.panel}>
        <button type="button" className={classes.panelBack} onClick={() => setChanging(false)}>
          <ArrowLeft size={14} />
          Back
        </button>
        <ServicePickerList
          onPick={(serviceId) => {
            const next = serviceById(serviceId);
            onChange({ service: next.id, name: next.id === CUSTOM_SERVICE_ID ? "" : next.name, action: next.action });
            setChanging(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className={classes.panel}>
      <button type="button" className={classes.panelHead} onClick={() => setChanging(true)}>
        <ServiceLogo service={row.service} size="md" />
        <span className={classes.panelName}>{row.name || "Custom"}</span>
        <span className={classes.panelChange}>
          Change
          <ChevronRight size={13} />
        </span>
      </button>

      <div className={classes.panelBody}>
        {contact ? (
          <ContactField kind={contact} autoFocus url={row.url} onChange={(url) => onChange({ url })} />
        ) : (
          <DetailField label="Link">
            <input
              autoFocus
              className={list.input}
              placeholder={`Paste the ${row.name || "service"} link`}
              inputMode="url"
              value={row.url}
              onChange={(e) => onChange({ url: e.currentTarget.value })}
            />
          </DetailField>
        )}

        {custom && (
          <DetailField label="Name">
            <input className={list.input} placeholder="Name shown on the page" maxLength={40} value={row.name} onChange={(e) => onChange({ name: e.currentTarget.value })} />
          </DetailField>
        )}

        <div className={list.field}>
          <span className={list.fieldLabel}>Button</span>
          <div className={list.pills}>
            {QUICK_ACTIONS.map((action) => (
              <button key={action} type="button" className={list.pill} data-active={row.action === action || undefined} onClick={() => onChange({ action })}>
                {action}
              </button>
            ))}
            <input
              className={list.pillInput}
              aria-label="Custom button label"
              placeholder="Custom"
              maxLength={16}
              value={QUICK_ACTIONS.includes(row.action) ? "" : row.action}
              onChange={(e) => onChange({ action: e.currentTarget.value })}
            />
          </div>
        </div>
      </div>

      <div className={classes.panelFoot}>
        <label className={classes.panelToggle}>
          <Toggle size="sm" checked={row.enabled} label="Show on page" onChange={(enabled) => onChange({ enabled })} />
          Show on page
        </label>
        <button type="button" className={list.deleteButton} onClick={onRemove}>
          Remove
        </button>
      </div>
    </div>
  );
}
