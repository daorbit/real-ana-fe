import { useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Loader } from "@mantine/core";
import { WidgetRenderer } from "@/features/analytics/components/widgets/WidgetRenderer";
import { usePublicAccent } from "@/features/analytics/components/public/usePublicAccent";
import { usePublicEmbed } from "@/features/embed/hooks/usePublicEmbed";
import { useEmbedTheme, useReportHeight } from "@/features/embed/hooks/useEmbedChrome";
import { rangeLong } from "@/features/dashboards/types";
import classes from "@/features/embed/components/Embed.module.css";

const SITE = "https://quantalog.daorbit.in";

export default function EmbedWidget() {
  const { token } = useParams<{ token: string }>();
  const [params] = useSearchParams();
  const preview = params.get("preview") === "1";
  const { embed, state } = usePublicEmbed(token, preview, params.get("v"));
  const ref = useRef<HTMLDivElement>(null);

  useEmbedTheme(embed?.theme, "quantalog-embed");
  useReportHeight(ref, token);
  usePublicAccent(ref, embed?.brand?.accentColor);

  return (
    <div ref={ref} className={classes.root}>
      {state === "loading" && (
        <div className={classes.state}><Loader size="sm" color="gray" /></div>
      )}
      {state === "missing" && (
        <div className={classes.state}>This widget is no longer available.</div>
      )}
      {state === "ready" && embed && (
        <>
          <WidgetRenderer
            id={embed.widget}
            data={{
              stats: embed.data,
              embedded: true,
              trafficTitle: `${embed.name} — ${rangeLong(embed.range)}`,
            }}
          />
          {embed.brand?.showPoweredBy !== false && (
            <div className={classes.foot}>
              <a className={classes.brand} href={SITE} target="_blank" rel="noopener noreferrer">
                Analytics by Quantalog
              </a>
            </div>
          )}
        </>
      )}
    </div>
  );
}
