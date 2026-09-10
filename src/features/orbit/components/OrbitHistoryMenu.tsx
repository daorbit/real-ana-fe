import { useState } from "react";
import {
  Menu, Text, Group, ActionIcon, Tooltip, ScrollArea, Stack, Loader, Box, TextInput,
} from "@mantine/core";
import { History, Trash2, Plus, Pencil, Check, X } from "lucide-react";
import type { useOrbitChat } from "@/features/orbit/useOrbitChat";

/**
 * Past conversations, reachable from the panel header.
 *
 * A dropdown rather than the sidebar this would be in a full-page assistant.
 * The panel is 400px wide; a column of titles beside a column of messages would
 * leave neither enough room to read, and history is something you reach for
 * occasionally rather than something you want on screen while typing.
 *
 * Absent entirely when there is nothing saved yet — an empty history control in
 * the header of a brand new chat is a promise of a feature rather than one.
 */

/** How long ago, in the shortest form that is still unambiguous. */
function ago(iso: string): string {
  const then = new Date(iso).getTime();
  const mins = Math.round((Date.now() - then) / 60000);
  if (mins < 1) return "now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(then).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

export function OrbitHistoryMenu({ chat }: { chat: ReturnType<typeof useOrbitChat> }) {
  const {
    conversations, conversationId, openConversation, deleteConversation,
    renameConversation, loadingConversation, reset, started,
  } = chat;

  /** The row being renamed, and the text so far. Only ever one at a time. */
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  if (!conversations.length) return null;

  const beginRename = (id: string, title: string) => {
    setEditing(id);
    setDraft(title);
  };

  const commitRename = async (id: string) => {
    const title = draft.trim();
    setEditing(null);
    // Unchanged or emptied: nothing to save, and an empty title would leave the
    // row unlabelled in the list.
    if (!title || title === conversations.find((c) => c.id === id)?.title) return;
    try {
      await renameConversation(id, title);
    } catch {
      // The old title stays on screen, which is the truth until the list
      // refetches. Not worth a toast over a cosmetic write.
    }
  };

  return (
    <Menu position="bottom-end" withArrow shadow="md" radius="md" width={300} closeOnItemClick={false}>
      <Menu.Target>
        <Tooltip label="Past conversations" withArrow>
          <ActionIcon variant="subtle" color="gray" size="sm" aria-label="Past conversations">
            <History size={14} />
          </ActionIcon>
        </Tooltip>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Label>
          <Group justify="space-between" wrap="nowrap">
            <span>Conversations</span>
            {loadingConversation && <Loader size={10} type="dots" />}
          </Group>
        </Menu.Label>

        {/* Only when there is something to leave. On a fresh panel this would
            be a control that does nothing visible. */}
        {started && (
          <Menu.Item leftSection={<Plus size={13} />} onClick={reset}>
            <Text size="xs">New conversation</Text>
          </Menu.Item>
        )}

        <Menu.Divider />

        {/* Bounded so a workspace with thirty threads does not produce a
            dropdown taller than the window. */}
        <ScrollArea.Autosize mah={280} type="hover" scrollbarSize={6}>
          <Stack gap={0}>
            {conversations.map((c) => {
              const active = c.id === conversationId;

              if (editing === c.id) {
                return (
                  <Box key={c.id} px={8} py={6}>
                    <TextInput
                      size="xs"
                      value={draft}
                      autoFocus
                      onChange={(e) => setDraft(e.currentTarget.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void commitRename(c.id);
                        }
                        if (e.key === "Escape") setEditing(null);
                      }}
                      rightSectionWidth={48}
                      rightSection={
                        <Group gap={0} wrap="nowrap">
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            size="xs"
                            onClick={() => setEditing(null)}
                            aria-label="Cancel rename"
                          >
                            <X size={11} />
                          </ActionIcon>
                          <ActionIcon
                            variant="subtle"
                            color="emerald"
                            size="xs"
                            onClick={() => void commitRename(c.id)}
                            aria-label="Save title"
                          >
                            <Check size={11} />
                          </ActionIcon>
                        </Group>
                      }
                    />
                  </Box>
                );
              }

              return (
                <Menu.Item
                  key={c.id}
                  onClick={() => void openConversation(c.id)}
                  // Bounded, or the label section grows to fit and `truncate`
                  // never engages — same reason as the model picker.
                  styles={{ itemLabel: { minWidth: 0 } }}
                  rightSection={
                    <Group gap={0} wrap="nowrap">
                      <ActionIcon
                        variant="subtle"
                        color="gray"
                        size="xs"
                        aria-label="Rename conversation"
                        onClick={(e) => {
                          // Without this the click also opens the thread, and
                          // the field is replaced the instant it appears.
                          e.stopPropagation();
                          beginRename(c.id, c.title);
                        }}
                      >
                        <Pencil size={11} />
                      </ActionIcon>
                      <ActionIcon
                        variant="subtle"
                        color="red"
                        size="xs"
                        aria-label="Delete conversation"
                        onClick={(e) => {
                          e.stopPropagation();
                          void deleteConversation(c.id).catch(() => {});
                        }}
                      >
                        <Trash2 size={11} />
                      </ActionIcon>
                    </Group>
                  }
                >
                  <Text size="xs" fw={active ? 600 : 400} lh={1.35} truncate>
                    {c.title}
                  </Text>
                  <Text size="10px" c="dimmed" lh={1.35}>
                    {ago(c.lastMessageAt)} · {Math.floor(c.messageCount / 2)} question
                    {c.messageCount === 2 ? "" : "s"}
                  </Text>
                </Menu.Item>
              );
            })}
          </Stack>
        </ScrollArea.Autosize>
      </Menu.Dropdown>
    </Menu>
  );
}
