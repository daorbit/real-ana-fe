import { NavTreeNode } from "./NavTreeNode";
import { SeoPageLinks } from "./SeoPageLinks";
import type { NavItem } from "./navItems";

export function SeoTreeNode({
  item,
  label,
  active,
  pathname,
}: {
  item: NavItem;
  label: string;
  active: boolean;
  pathname: string;
}) {
  return (
    <NavTreeNode
      item={item}
      label={label}
      active={active}
      openKey="nav:seo-pages-open"
      forceOpen={false}
      toggleLabel={`${label} pages`}
    >
      <SeoPageLinks pathname={pathname} />
    </NavTreeNode>
  );
}
