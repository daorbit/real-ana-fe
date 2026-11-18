import { PageTabs, type PageTabItem } from "@/shared/ui/PageTabs";
import { SEO_TABS, type SeoTabId } from "../sections";
import type { SeoTabCount } from "./SeoTabs";

export function SeoTabBar({
  active,
  counts,
  onChange,
}: {
  active: SeoTabId;
  counts: Partial<Record<SeoTabId, SeoTabCount>>;
  onChange: (tab: SeoTabId) => void;
}) {
  const items: PageTabItem<SeoTabId>[] = SEO_TABS.map((t) => ({
    id: t.id,
    label: t.label,
    icon: t.icon,
    count: counts[t.id]?.value,
    alarm: counts[t.id]?.alarm,
  }));

  return (
    <PageTabs
      items={items}
      active={active}
      onChange={onChange}
      label="SEO sections"
      idPrefix="seo"
      variant="segmented"
    />
  );
}
