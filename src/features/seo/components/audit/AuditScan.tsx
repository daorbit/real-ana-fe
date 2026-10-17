import { Lock } from "lucide-react";
import { SiteFavicon } from "@/shared/ui/SiteFavicon";
import { AuditWireframe } from "./AuditWireframe";
import { AuditStatus } from "./AuditStatus";
import { useAuditProgress } from "./useAuditProgress";
import classes from "./AuditScan.module.css";

export function AuditScan({ url, running }: { url: string; running: boolean }) {
  const { phase, check, clock } = useAuditProgress(running);
  const display = url.replace(/^https?:\/\//, "").replace(/\/$/, "") || "your page";
  const domain = display.split("/")[0];

  return (
    <div className={classes.root} data-phase={phase}>
      <div className={classes.browser}>
        <div className={classes.chrome}>
          <span className={classes.dots}>
            <i />
            <i />
            <i />
          </span>
          <span className={classes.address}>
            <Lock size={11} className={classes.lock} />
            <SiteFavicon domain={domain} size={13} />
            <span className={classes.addressText}>{display}</span>
          </span>
          <span className={classes.loadBar} />
        </div>
        <AuditWireframe phase={phase} />
      </div>

      <AuditStatus phase={phase} check={check} clock={clock} />
    </div>
  );
}
