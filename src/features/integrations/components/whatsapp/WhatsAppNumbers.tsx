import { ActionIcon, Switch, Text, Tooltip } from "@mantine/core";
import { Smartphone, Trash2 } from "lucide-react";
import { timeAgo } from "@/shared/lib/format";
import type { useWhatsAppConnection } from "../../hooks/useWhatsAppConnection";
import telegramClasses from "../telegram/Telegram.module.css";

export function WhatsAppNumbers({ wa }: { wa: ReturnType<typeof useWhatsAppConnection> }) {
  const numbers = wa.status?.numbers ?? [];

  if (!numbers.length) {
    return (
      <div className={telegramClasses.rows}>
        <Text size="xs" c="dimmed" className={telegramClasses.empty}>
          No numbers yet. Add one below and verify it with the code we send.
        </Text>
      </div>
    );
  }

  return (
    <div className={telegramClasses.rows}>
      <div className={telegramClasses.list}>
        {numbers.map((n) => (
          <div key={n.phone} className={telegramClasses.row}>
            <span className={telegramClasses.rowIcon}>
              <Smartphone size={15} />
            </span>
            <div className={telegramClasses.rowText}>
              <div className={telegramClasses.rowTitle}>{n.label || `+${n.phone}`}</div>
              <div className={telegramClasses.rowTag}>
                {n.label ? `+${n.phone} · ` : ""}verified {timeAgo(n.verifiedAt)}
              </div>
            </div>
            <Switch
              size="sm"
              label="Form alerts"
              labelPosition="left"
              className={telegramClasses.alertSwitch}
              checked={n.formAlerts}
              disabled={wa.savingAlertsFor === n.phone}
              onChange={(e) => void wa.toggleFormAlerts(n, e.currentTarget.checked)}
            />
            <Tooltip label="Remove" withArrow>
              <ActionIcon size="md" variant="subtle" color="gray" onClick={() => wa.remove(n)} aria-label={`Remove +${n.phone}`}>
                <Trash2 size={15} />
              </ActionIcon>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  );
}
