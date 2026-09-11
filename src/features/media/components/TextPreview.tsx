import { useEffect, useState } from "react";
import { Center, Loader, ScrollArea, Text } from "@mantine/core";
import { TEXT_PREVIEW_MAX_BYTES } from "../lib";

/**
 * A plain-text file (csv, txt, log, json, ...) fetched and printed as-is.
 *
 * No parsing into a table: a csv's columns can be anything, and a raw grid of
 * text is honest about what the file actually contains, unlike a table that
 * would silently reflow a malformed row.
 */
export function TextPreview({ url }: { url: string }) {
  const [state, setState] = useState<
    { status: "loading" } | { status: "ready"; text: string; truncated: boolean } | { status: "error" }
  >({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`${res.status}`);
        return res.text();
      })
      .then((full) => {
        if (cancelled) return;
        const truncated = full.length > TEXT_PREVIEW_MAX_BYTES;
        setState({
          status: "ready",
          text: truncated ? full.slice(0, TEXT_PREVIEW_MAX_BYTES) : full,
          truncated,
        });
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div data-text-preview style={{ width: "100%", height: "100%", minHeight: 0 }}>
      {state.status === "loading" ? (
        <Center h="100%">
          <Loader size="sm" />
        </Center>
      ) : state.status === "error" ? (
        <Center h="100%">
          <Text size="sm" c="dimmed">
            Couldn't load a preview for this file.
          </Text>
        </Center>
      ) : (
        <ScrollArea h="100%" type="auto">
          <Text
            component="pre"
            size="xs"
            ff="monospace"
            p="sm"
            style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
          >
            {state.text}
            {state.truncated ? "\n…truncated" : ""}
          </Text>
        </ScrollArea>
      )}
    </div>
  );
}
