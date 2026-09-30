import { Text } from "@mantine/core";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { SearchInspection } from "@/shared/types";
import { pagePath } from "../searchMetrics";
import classes from "./pageDetail.module.css";

function humanType(value: string) {
  return value.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

function sameUrl(a: string, b: string) {
  return a.replace(/\/+$/, "").toLowerCase() === b.replace(/\/+$/, "").toLowerCase();
}

export function IndexInspectionDetails({ data }: { data: SearchInspection }) {
  const canonicalMismatch =
    data.googleCanonical && data.userCanonical && !sameUrl(data.googleCanonical, data.userCanonical);
  const richResults = data.richResults ?? [];

  return (
    <>
      {canonicalMismatch && (
        <div className={classes.inspectWarn}>
          <AlertTriangle size={14} />
          <div>
            <Text size="xs" fw={650}>
              Google picked a different canonical
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              You declared <b title={data.userCanonical}>{pagePath(data.userCanonical!)}</b>, but Google treats{" "}
              <b title={data.googleCanonical}>{pagePath(data.googleCanonical!)}</b> as the main version, so this
              page&apos;s ranking signals go there.
            </Text>
          </div>
        </div>
      )}

      {richResults.length > 0 && (
        <div className={classes.inspectGroup}>
          <span className={classes.inspectLabel}>Rich results</span>
          {richResults.map((r) => (
            <div key={r.type} className={classes.richResult} data-ok={r.issues.length === 0 || undefined}>
              {r.issues.length === 0 ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />}
              <div>
                <Text size="xs" fw={600}>
                  {humanType(r.type)}
                  {r.items > 1 ? ` · ${r.items} items` : ""}
                </Text>
                {r.issues.slice(0, 3).map((issue) => (
                  <Text key={issue.message} size="xs" c="dimmed">
                    {issue.message}
                  </Text>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {data.sitemaps && (
        <div className={classes.inspectGroup}>
          <span className={classes.inspectLabel}>In sitemaps</span>
          {data.sitemaps.length ? (
            data.sitemaps.map((s) => (
              <Text key={s} size="xs" className={classes.inspectPath} title={s}>
                {pagePath(s)}
              </Text>
            ))
          ) : (
            <Text size="xs" c="dimmed">
              Not listed in any sitemap. Add it so Google finds updates sooner.
            </Text>
          )}
        </div>
      )}

      {data.referringUrls && data.referringUrls.length > 0 && (
        <div className={classes.inspectGroup}>
          <span className={classes.inspectLabel}>Google found it via</span>
          {data.referringUrls.slice(0, 3).map((u) => (
            <Text key={u} size="xs" className={classes.inspectPath} title={u}>
              {pagePath(u)}
            </Text>
          ))}
        </div>
      )}
    </>
  );
}
