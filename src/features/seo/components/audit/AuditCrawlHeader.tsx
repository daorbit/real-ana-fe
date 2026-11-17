import { Button, Group, Text } from "@mantine/core";
import { Lock, Minimize2, X } from "lucide-react";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import classes from "./AuditCrawl.module.css";

interface Props {
  display: string;
  domain: string;
  onMinimize: () => void;
  onCancel: () => void;
}

export function AuditCrawlHeader({ display, domain, onMinimize, onCancel }: Props) {
  return (
    <header className={classes.header}>
      <div className={classes.headMain}>
        <span className={classes.live}>
          <span className={classes.liveDot} />
          <Text fw={650} fz={15} component="span">
            Running SEO audit
          </Text>
        </span>
        <span className={classes.address} translate="no">
          <Lock size={12} className={classes.lock} />
          <SiteFavicon domain={domain} size={14} />
          <span className={classes.addressText}>{display}</span>
        </span>
      </div>

      <Group gap="xs" wrap="nowrap">
        <Button variant="default" size="xs" leftSection={<Minimize2 size={14} />} onClick={onMinimize}>
          Minimize
        </Button>
        <Button variant="default" size="xs" leftSection={<X size={14} />} onClick={onCancel}>
          Cancel
        </Button>
      </Group>
    </header>
  );
}
