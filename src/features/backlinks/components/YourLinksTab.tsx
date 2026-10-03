import { useMemo, useState } from "react";
import { SegmentedControl } from "@mantine/core";
import { Plus } from "lucide-react";
import type { Backlink } from "../types";
import { STATUS_FILTERS, matchesFilter, type StatusFilter } from "../utils/labels";
import { BacklinkTable } from "./BacklinkTable";
import { UrlForm } from "./UrlForm";
import classes from "./Backlinks.module.css";

export function YourLinksTab({
  backlinks,
  canEdit,
  adding,
  recheckingId,
  onAdd,
  onRecheck,
  onRemove,
}: {
  backlinks: Backlink[];
  canEdit: boolean;
  adding: boolean;
  recheckingId: string | null;
  onAdd: (url: string) => Promise<boolean>;
  onRecheck: (id: string) => void;
  onRemove: (id: string, domain: string) => void;
}) {
  const [filter, setFilter] = useState<StatusFilter>("all");
  const visible = useMemo(() => backlinks.filter((b) => matchesFilter(b.status, filter)), [backlinks, filter]);

  return (
    <section className={`${classes.card} ${classes.flush}`}>
      <div className={classes.cardHead}>
        <div>
          <h3 className={classes.cardTitle}>Pages linking to you</h3>
          <p className={classes.cardSub}>
            Every page that links to your site, whether found in your referrers, imported or added by hand, along with what the
            link looks like and whether it is still there.
          </p>
        </div>
        <SegmentedControl
          size="xs"
          radius="md"
          value={filter}
          onChange={(v) => setFilter(v as StatusFilter)}
          data={STATUS_FILTERS.map((f) => ({ value: f.value, label: f.label }))}
        />
      </div>

      {canEdit && (
        <div className={classes.toolbar}>
          <UrlForm
            placeholder="https://example.com/article-that-links-to-you"
            label="Track this backlink"
            hint="Know a page that links to you but has never sent a visitor? Paste it here and it will be checked and tracked."
            icon={Plus}
            loading={adding}
            onSubmit={onAdd}
          />
        </div>
      )}

      <BacklinkTable
        backlinks={visible}
        canEdit={canEdit}
        recheckingId={recheckingId}
        onRecheck={onRecheck}
        onRemove={onRemove}
        emptyText={filter === "all" ? "No backlinks tracked yet." : "No backlinks match this filter."}
      />
    </section>
  );
}
