import { useEffect } from "react";
import { useGetBrandingQuery } from "@/app/store";
import { dateTime } from "@/shared/lib";
import classes from "@/features/dashboards/components/print/DashboardPrint.module.css";

export function DashboardPrintCover({
  workspaceId,
  workspaceName,
  title,
  subtitle,
  rangeLabel,
  scopeLabel,
  skipBranding,
  onReady,
}: {
  workspaceId: string;
  workspaceName: string;
  title: string;
  subtitle: string;
  rangeLabel: string;
  scopeLabel: string;
  skipBranding: boolean;
  onReady: () => void;
}) {
  const { data: branding, isFetching } = useGetBrandingQuery(workspaceId, { skip: skipBranding });
  const ready = skipBranding || !isFetching;

  useEffect(() => {
    if (ready) onReady();
  }, [ready, onReady]);

  const brandName = branding?.name || workspaceName;

  return (
    <header className={classes.cover}>
      <div>
        <div className={classes.brand}>
          {branding?.logoUrl && <img src={branding.logoUrl} alt="" className={classes.logo} />}
          {brandName}
        </div>
        <h1 className={classes.title}>{title}</h1>
        <div className={classes.subtitle}>{subtitle}</div>
      </div>
      <div className={classes.meta}>
        <span>{rangeLabel}</span>
        <span>{scopeLabel}</span>
        <span>Generated {dateTime(new Date())}</span>
      </div>
    </header>
  );
}
