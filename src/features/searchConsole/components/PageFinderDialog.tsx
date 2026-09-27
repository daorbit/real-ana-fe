import { useEffect, useRef, useState } from "react";
import { Loader, Modal, Text } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { ArrowRight, CornerDownLeft, FileText, Search } from "lucide-react";
import { useGetSearchBreakdownQuery } from "@/app/store";
import type { SearchType } from "@/shared/types";
import { METRIC_BY_KEY, pagePath, propertyLabel, resolvePageUrl } from "../searchMetrics";
import { PositionChip } from "./SearchCells";
import classes from "./finder.module.css";

type FinderItem = { url: string; direct: boolean; clicks?: number; impressions?: number; position?: number };

function slugOf(propertyUrl: string, input: string) {
  const host = propertyLabel(propertyUrl);
  return input
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(new RegExp(`^${host.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i"), "")
    .replace(/^\/+/, "");
}

export function PageFinderDialog({
  opened,
  onClose,
  workspaceId,
  siteId,
  propertyUrl,
  days,
  type,
  onOpen,
}: {
  opened: boolean;
  onClose: () => void;
  workspaceId: string;
  siteId: string;
  propertyUrl: string;
  days: number;
  type: SearchType;
  onOpen: (url: string) => void;
}) {
  const [value, setValue] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const slug = slugOf(propertyUrl, value);
  const [q] = useDebouncedValue(slug, 200);

  const { data, isFetching } = useGetSearchBreakdownQuery(
    { workspaceId, siteId, dimension: "page", days, type, page: 1, pageSize: 8, sort: "clicks", dir: "desc", q },
    { skip: !opened },
  );

  useEffect(() => {
    if (!opened) setValue("");
  }, [opened]);

  const directUrl = resolvePageUrl(propertyUrl, `/${slug}`);
  const rows: FinderItem[] = (data?.rows ?? []).map((r) => ({
    url: r.key,
    direct: false,
    clicks: r.clicks,
    impressions: r.impressions,
    position: r.position,
  }));
  const hasExact = rows.some((r) => pagePath(r.url) === pagePath(directUrl));
  const items: FinderItem[] = slug && !hasExact ? [{ url: directUrl, direct: true }, ...rows] : rows;

  useEffect(() => setActive(0), [q, items.length]);

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const choose = (item?: FinderItem) => {
    if (!item) return;
    onClose();
    onOpen(item.url);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      withCloseButton={false}
      size={600}
      radius="lg"
      yOffset="12vh"
      padding={0}
      overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
      classNames={{ content: classes.content }}
    >
      <div className={classes.field}>
        <Search size={17} className={classes.fieldIcon} />
        <span className={classes.prefix}>{propertyLabel(propertyUrl)}/</span>
        <input
          className={classes.input}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          placeholder="pricing"
          autoFocus
          spellCheck={false}
          aria-label="Page path"
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, items.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose(items[active]);
            }
          }}
        />
        {isFetching && <Loader size={14} />}
      </div>

      <div className={classes.list} ref={listRef} role="listbox">
        <Text className={classes.section}>{slug ? "Matching pages" : "Top pages on Google"}</Text>
        {items.length === 0 && !isFetching && (
          <Text className={classes.empty}>No pages with Google data yet.</Text>
        )}
        {items.map((item, i) => (
          <button
            key={`${item.direct}-${item.url}`}
            type="button"
            role="option"
            aria-selected={i === active}
            data-index={i}
            data-active={i === active || undefined}
            className={classes.item}
            onMouseEnter={() => setActive(i)}
            onClick={() => choose(item)}
          >
            <span className={classes.itemIcon}>
              {item.direct ? <ArrowRight size={14} /> : <FileText size={14} />}
            </span>
            <span className={classes.itemPath}>
              {item.direct ? (
                <>
                  Open <b>{pagePath(item.url)}</b>
                </>
              ) : (
                pagePath(item.url)
              )}
            </span>
            {!item.direct && (
              <span className={classes.itemStats}>
                <span>{METRIC_BY_KEY.clicks.format(item.clicks ?? 0)} clicks</span>
                <span>{METRIC_BY_KEY.impressions.format(item.impressions ?? 0)} impr.</span>
                <PositionChip position={item.position ?? 0} />
              </span>
            )}
          </button>
        ))}
      </div>

      <div className={classes.footer}>
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> to navigate
        </span>
        <span>
          <kbd>
            <CornerDownLeft size={10} />
          </kbd>{" "}
          to open
        </span>
        <span>
          <kbd>esc</kbd> to close
        </span>
      </div>
    </Modal>
  );
}
