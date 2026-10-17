import { useState } from "react";
import { Anchor, Button, Checkbox, Loader, Text } from "@mantine/core";
import { Settings2, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useGetWhatsAppStatusQuery } from "@/app/store";
import { useRefetchOnFocus } from "@/shared/hooks/useRefetchOnFocus";
import classes from "@/features/integrations/components/telegram/Telegram.module.css";
import { appsPath } from "@/features/integrations/lib/appsPath";

const CONNECTIONS_URL = appsPath("whatsapp");
const FOCUS_MIN_AGE_MS = 1500;

interface Props {
  workspaceId: string;
  selected: string[];
  onSelect: (numbers: string[]) => void;
}

export function WhatsAppDelivery({ workspaceId, selected, onSelect }: Props) {
  const { t } = useTranslation();
  const query = useGetWhatsAppStatusQuery(workspaceId);
  const status = query.currentData;
  const [awaitingReturn, setAwaitingReturn] = useState(false);
  useRefetchOnFocus(query.refetch, query.fulfilledTimeStamp, FOCUS_MIN_AGE_MS, awaitingReturn);

  if (!status) {
    return (
      <div className={classes.loading}>
        <Loader size="xs" />
      </div>
    );
  }

  const manage = (
    <Anchor
      component={Link}
      to={CONNECTIONS_URL}
      target="_blank"
      size="xs"
      className={classes.inline}
      onClick={() => setAwaitingReturn(true)}
    >
      <Settings2 size={12} />
      {t("reports.waManageInConnections")}
    </Anchor>
  );

  if (!status.enabled || !status.numbers.length) {
    return (
      <div className={classes.delivery}>
        <Text size="xs" c="dimmed">
          {t("reports.waNotConnected")}
        </Text>
        <div>
          <Button
            component={Link}
            to={CONNECTIONS_URL}
            target="_blank"
            size="xs"
            variant="light"
            leftSection={<Smartphone size={14} />}
            onClick={() => setAwaitingReturn(true)}
          >
            {t("reports.waConnect")}
          </Button>
        </div>
      </div>
    );
  }

  const toggle = (phone: string, on: boolean) =>
    onSelect(on ? [...new Set([...selected, phone])] : selected.filter((p) => p !== phone));

  return (
    <div className={classes.delivery}>
      <div className={classes.rows}>
        <div className={classes.list}>
          {status.numbers.map((n) => (
            <label key={n.phone} className={classes.row}>
              <Checkbox
                size="xs"
                checked={selected.includes(n.phone)}
                onChange={(e) => toggle(n.phone, e.currentTarget.checked)}
                aria-label={n.label || `+${n.phone}`}
              />
              <span className={classes.rowIcon}>
                <Smartphone size={15} />
              </span>
              <div className={classes.rowText}>
                <div className={classes.rowTitle}>{n.label || `+${n.phone}`}</div>
                {n.label && <div className={classes.rowTag}>+{n.phone}</div>}
              </div>
            </label>
          ))}
        </div>
      </div>
      <Text size="xs" c="dimmed" className={classes.inline}>
        {manage}
      </Text>
    </div>
  );
}
