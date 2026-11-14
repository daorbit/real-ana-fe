import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { BIO_SERVICES } from "@/features/bio/lib/serviceCatalog";
import { ServiceLogo } from "../../ServiceLogo";
import classes from "./List.module.css";

export function ServicePickerList({ exclude = [], onPick }: { exclude?: string[]; onPick: (serviceId: string) => void }) {
  const [query, setQuery] = useState("");
  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    return BIO_SERVICES.filter((s) => (s.id === "custom" || !exclude.includes(s.id)) && (!q || s.name.toLowerCase().includes(q)));
  }, [query, exclude]);

  return (
    <div className={classes.picker}>
      <label className={classes.search}>
        <Search size={14} aria-hidden />
        <input className={classes.searchInput} placeholder="Search services" value={query} onChange={(e) => setQuery(e.currentTarget.value)} />
      </label>
      <div className={classes.options} role="listbox" aria-label="Services">
        {items.map((service) => (
          <button key={service.id} type="button" role="option" aria-selected={false} className={classes.option} onClick={() => onPick(service.id)}>
            <ServiceLogo service={service.id} size="sm" />
            <span>{service.name}</span>
          </button>
        ))}
        {items.length === 0 && <span className={classes.noResults}>No match. Use Custom for anything else.</span>}
      </div>
    </div>
  );
}
