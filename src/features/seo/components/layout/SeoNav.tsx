import { Select } from "@mantine/core";
import { SEO_NAV, SEO_SECTIONS, type SeoSectionId } from "../sections";
import classes from "./SeoLayout.module.css";

export type SeoNavCount = { value: number; alarm?: boolean };

interface Props {
  active: SeoSectionId;
  counts: Partial<Record<SeoSectionId, SeoNavCount>>;
  onChange: (id: SeoSectionId) => void;
}

export function SeoNav({ active, counts, onChange }: Props) {
  const selectData = SEO_NAV.map((g, i) => ({
    group: g.label ?? (i === 0 ? "Summary" : "Records"),
    items: g.items.map((s) => {
      const c = counts[s.id];
      return { value: s.id, label: c && c.value > 0 ? `${s.label} (${c.value})` : s.label };
    }),
  }));

  return (
    <>
      <nav className={classes.nav} aria-label="SEO report sections">
        {SEO_NAV.map((group, gi) => (
          <div key={gi} className={classes.navGroup} data-footer={gi === SEO_NAV.length - 1 || undefined}>
            {group.label && <div className={classes.navGroupLabel}>{group.label}</div>}
            {group.items.map((s) => {
              const Icon = s.icon;
              const c = counts[s.id];
              const isActive = active === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={classes.navItem}
                  data-active={isActive || undefined}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => onChange(s.id)}
                >
                  <Icon size={16} className={classes.navIcon} />
                  <span className={classes.navLabel}>{s.label}</span>
                  {c && c.value > 0 && (
                    <span className={classes.navCount} data-alarm={c.alarm || undefined}>
                      {c.value}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <Select
        className={classes.navSelect}
        aria-label="SEO report section"
        data={selectData}
        value={active}
        onChange={(v) => v && SEO_SECTIONS.some((s) => s.id === v) && onChange(v as SeoSectionId)}
        allowDeselect={false}
        comboboxProps={{ withinPortal: true }}
      />
    </>
  );
}
