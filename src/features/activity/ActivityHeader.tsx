import { ActionIcon, Button, Tooltip } from "@mantine/core";
import { Bell, CheckCheck, ListChecks, Trash2, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import styles from "./ActivityDrawer.module.css";

export type ActivityTab = "all" | "unread";

function short(count: number) {
  return count > 99 ? "99+" : String(count);
}

export function ActivityHeader({
  tab,
  unreadCount,
  canMarkAll,
  markingAll,
  canSelect,
  selecting,
  selectedCount,
  deleting,
  onTab,
  onMarkAll,
  onSelect,
  onCancelSelect,
  onDelete,
  onClose,
}: {
  tab: ActivityTab;
  unreadCount: number;
  canMarkAll: boolean;
  markingAll: boolean;
  canSelect: boolean;
  selecting: boolean;
  selectedCount: number;
  deleting: boolean;
  onTab: (tab: ActivityTab) => void;
  onMarkAll: () => void;
  onSelect: () => void;
  onCancelSelect: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();

  return (
    <div className={styles.header}>
      <div className={styles.headTop}>
        <span className={styles.headIcon}><Bell size={17} /></span>
        <div className={styles.headText}>
          <h2 className={styles.title}>{t("activity.title", "Notifications")}</h2>
          <span className={styles.subtitle}>
            {unreadCount > 0
              ? t("activity.unreadSummary", "{{count}} unread", { count: unreadCount })
              : t("activity.empty.unreadTitle", "You're all caught up")}
          </span>
        </div>
        <div className={styles.headActions}>
          {!selecting && (
            <>
              <Tooltip label={t("activity.markAllRead", "Mark all as read")} withArrow>
                <ActionIcon
                  variant="default"
                  size={32}
                  radius="md"
                  disabled={!canMarkAll}
                  loading={markingAll}
                  onClick={onMarkAll}
                  aria-label={t("activity.markAllRead", "Mark all as read")}
                >
                  <CheckCheck size={15} />
                </ActionIcon>
              </Tooltip>
              <Tooltip label={t("activity.select", "Select notifications")} withArrow>
                <ActionIcon
                  variant="default"
                  size={32}
                  radius="md"
                  disabled={!canSelect}
                  onClick={onSelect}
                  aria-label={t("activity.select", "Select notifications")}
                >
                  <ListChecks size={15} />
                </ActionIcon>
              </Tooltip>
            </>
          )}
          <ActionIcon variant="subtle" color="gray" size={32} radius="md" onClick={onClose} aria-label={t("activity.close", "Close")}>
            <X size={17} />
          </ActionIcon>
        </div>
      </div>

      {selecting ? (
        <div className={styles.selectBar}>
          <span className={styles.selectCount}>
            {t("activity.selectedCount", "{{count}} selected", { count: selectedCount })}
          </span>
          <div className={styles.selectActions}>
            <Button variant="subtle" color="gray" size="compact-sm" onClick={onCancelSelect}>
              {t("activity.cancel", "Cancel")}
            </Button>
            <Button
              variant="light"
              color="red"
              size="compact-sm"
              leftSection={<Trash2 size={14} />}
              disabled={selectedCount === 0 || deleting}
              loading={deleting}
              onClick={onDelete}
            >
              {t("activity.deleteSelected", "Delete")}
            </Button>
          </div>
        </div>
      ) : (
        <div className={styles.switch} role="tablist" aria-label={t("activity.title", "Notifications")}>
          {(["all", "unread"] as const).map((value) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={tab === value}
              data-active={tab === value || undefined}
              className={styles.switchTab}
              onClick={() => onTab(value)}
            >
              {value === "all" ? t("activity.tabAll", "All") : t("activity.tabUnread", "Unread")}
              {value === "unread" && unreadCount > 0 && <span className={styles.switchCount}>{short(unreadCount)}</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
