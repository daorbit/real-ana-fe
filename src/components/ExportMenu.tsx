import { useState } from "react";
import { Menu, Button } from "@mantine/core";
import { Download, FileSpreadsheet, FileText, ChevronDown } from "lucide-react";
import { getToken } from "../api";
import { notify } from "../notify";

const BASE = import.meta.env.VITE_API_BASE ?? "";

/**
 * Download the raw events for the current window/scope as Excel or CSV.
 *
 * The file is a binary attachment, so it's fetched directly (with the auth
 * header) and saved via a blob URL rather than routed through RTK Query.
 */
export function ExportMenu({
  workspaceId,
  range,
  from,
  to,
  filter,
  sites,
}: {
  workspaceId: string | undefined;
  range: string;
  from?: string;
  to?: string;
  filter?: string;
  sites?: string[];
}) {
  const [busy, setBusy] = useState(false);

  const download = async (format: "xlsx" | "csv") => {
    if (!workspaceId || busy) return;
    setBusy(true);
    try {
      const qs = new URLSearchParams({ range, format });
      if (filter) qs.set("filter", filter);
      if (sites && sites.length) qs.set("sites", sites.join(","));
      if (range === "custom" && from && to) {
        qs.set("from", from);
        qs.set("to", to);
      }
      const token = getToken();
      const res = await fetch(`${BASE}/api/workspaces/${workspaceId}/export?${qs.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error(`Export failed (${res.status})`);

      const blob = await res.blob();
      // Pull the server's filename out of Content-Disposition when present.
      const cd = res.headers.get("Content-Disposition") ?? "";
      const named = /filename="([^"]+)"/.exec(cd)?.[1];
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = named ?? `quantalog-events.${format}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      notify.error("Could not export the data. Try again in a moment.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Menu shadow="md" position="bottom-end" radius="md" width={190}>
      <Menu.Target>
        <Button
          size="sm"
          variant="default"
          leftSection={<Download size={15} />}
          rightSection={<ChevronDown size={14} />}
          loading={busy}
          disabled={!workspaceId}
        >
          Export
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Download raw events</Menu.Label>
        <Menu.Item leftSection={<FileSpreadsheet size={15} />} onClick={() => download("xlsx")}>
          Excel (.xlsx)
        </Menu.Item>
        <Menu.Item leftSection={<FileText size={15} />} onClick={() => download("csv")}>
          CSV (.csv)
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
