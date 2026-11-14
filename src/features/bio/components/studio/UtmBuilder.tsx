import { useState } from "react";
import { Copy } from "lucide-react";
import { copyText } from "@/features/bio/lib/copyText";
import { trackedUrl, type UtmParams } from "@/features/bio/lib/utm";
import { DetailField } from "./ui/ExpandableRow";
import list from "./ui/List.module.css";
import classes from "./Share.module.css";

const FIELDS: { key: keyof UtmParams; label: string; placeholder: string }[] = [
  { key: "source", label: "Source", placeholder: "newsletter" },
  { key: "medium", label: "Medium", placeholder: "email" },
  { key: "campaign", label: "Campaign", placeholder: "diwali_sale" },
  { key: "content", label: "Content (optional)", placeholder: "header_button" },
];

export function UtmBuilder({ url, campaign }: { url: string; campaign: string }) {
  const [params, setParams] = useState<UtmParams>({ source: "", medium: "", campaign, content: "" });
  const result = trackedUrl(url, params);

  return (
    <div className={classes.builder}>
      <div className={classes.builderGrid}>
        {FIELDS.map((field) => (
          <DetailField key={field.key} label={field.label}>
            <input
              className={list.input}
              placeholder={field.placeholder}
              value={params[field.key] ?? ""}
              onChange={(e) => {
                const value = e.currentTarget.value;
                setParams((p) => ({ ...p, [field.key]: value }));
              }}
            />
          </DetailField>
        ))}
      </div>
      <code className={classes.preview}>{result}</code>
      <button type="button" className={classes.builderCopy} disabled={!params.source.trim()} onClick={() => void copyText(result)}>
        <Copy size={14} />
        Copy tracked link
      </button>
    </div>
  );
}
