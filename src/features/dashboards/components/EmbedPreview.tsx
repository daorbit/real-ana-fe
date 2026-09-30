import { useEffect, useRef, useState } from "react";
import { embedHeight, embedUrl } from "@/features/dashboards/embedSnippets";
import classes from "@/features/dashboards/components/Dashboards.module.css";

export function EmbedPreview({ token, widget, version }: { token: string | null; widget: string; version: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(embedHeight(widget));

  useEffect(() => setHeight(embedHeight(widget)), [widget]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== ref.current?.contentWindow) return;
      const data = e.data as { type?: string; height?: number };
      if (data?.type === "quantalog:embed-height" && typeof data.height === "number") {
        setHeight(Math.min(Math.max(data.height, 80), 1200));
      }
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return (
    <div className={classes.previewStage}>
      {token ? (
        <iframe
          ref={ref}
          key={`${token}:${version}`}
          className={classes.previewFrame}
          src={`${embedUrl(token)}?preview=1&v=${encodeURIComponent(version)}`}
          title="Embed preview"
          height={height}
        />
      ) : (
        <div className={classes.previewPlaceholder}>
          Create the embed to see a live preview and get the code.
        </div>
      )}
    </div>
  );
}
