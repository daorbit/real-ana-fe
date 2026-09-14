import { useState } from "react";
import {
  ActionIcon, Box, Button, Drawer, Group, Loader, ScrollArea, Stack, Text, TextInput,
  UnstyledButton,
} from "@mantine/core";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import type { useOrbitChat } from "@/features/orbit/useOrbitChat";
import classes from "./orbitPage.module.css";

/**
 * Saved threads, in a drawer off the right edge.
 *
 * A drawer rather than a permanent column: the conversation is the page, and a
 * list of titles parked beside it takes width from the thing people came for
 * while answering a question they only ask occasionally. Opening it is one
 * click on the header control, and picking a thread closes it again — so the
 * list is never between the user and what they were reading.
 *
 * Right-hand side deliberately. The rail already owns the left edge of the
 * window; a second panel sliding out on the same side reads as the navigation
 * growing a third level.
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

export function OrbitHistoryDrawer({
  chat,
  opened,
  onClose,
}: {
  chat: ReturnType<typeof useOrbitChat>;
  opened: boolean;
  onClose: () => void;
}) {
  const {
    conversations, conversationId, openConversation, deleteConversation,
    renameConversation, loadingConversation, reset, started,
  } = chat;

  /** The row being renamed, and the text so far. Only ever one at a time. */
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

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

  /** Open a thread and get out of the way — the thread is what was wanted. */
  const pick = (id: string) => {
    void openConversation(id);
    onClose();
  };

  const startNew = () => {
    reset();
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={320}
      padding={0}
      withCloseButton={false}
      // The rail stays reachable behind the overlay, and the drawer is a
      // sideshow rather than a mode — a heavy scrim would say otherwise.
      overlayProps={{ backgroundOpacity: 0.35, blur: 2 }}
      title={null}
      // A column, so the list can take the height the header and the
      // New-conversation button leave rather than guessing at it.
      styles={{
        content: { display: "flex", flexDirection: "column" },
        body: { display: "flex", flexDirection: "column", flex: 1, minHeight: 0 },
      }}
    >
      <Group justify="space-between" wrap="nowrap" px="md" pt="md" pb={10}>
        <Text size="sm" fw={650}>
          Conversations
        </Text>
        <Group gap={6} wrap="nowrap">
          {loadingConversation && <Loader size={11} type="dots" />}
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={onClose} aria-label="Close history">
            <X size={15} />
          </ActionIcon>
        </Group>
      </Group>

      <Box px="md" pb="sm">
        {/* Disabled rather than hidden on an empty thread: this is the drawer's
            primary action, and a button that comes and goes at the top of a
            list makes everything below it jump. */}
        <Button
          fullWidth
          variant="default"
          size="xs"
          radius="md"
          leftSection={<Plus size={14} />}
          onClick={startNew}
          disabled={!started}
        >
          New conversation
        </Button>
      </Box>

      <ScrollArea className={classes.drawerList} type="hover" scrollbarSize={6}>
        {!conversations.length ? (
          <Text size="xs" c="dimmed" lh={1.5} px={10} py={6}>
            Threads you start are saved here for everyone in this workspace.
          </Text>
        ) : (
          <Stack gap={0}>
            {conversations.map((c) => {
              const active = c.id === conversationId;

              if (editing === c.id) {
                return (
                  <Box key={c.id} px={4} py={4}>
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
                <UnstyledButton
                  key={c.id}
                  className={classes.thread}
                  data-active={active}
                  onClick={() => pick(c.id)}
                >
                  <Text size="xs" fw={active ? 600 : 400} lh={1.4} truncate pr={20}>
                    {c.title}
                  </Text>
                  <Text size="10px" c="dimmed" lh={1.4}>
                    {ago(c.lastMessageAt)} · {Math.floor(c.messageCount / 2)} question
                    {c.messageCount === 2 ? "" : "s"}
                  </Text>

                  {/* Hidden until the row is hovered or focused — see the CSS.
                      Divs, not nested buttons: the row itself is the button
                      that opens the thread. */}
                  <div className={classes.threadActions}>
                    <ActionIcon
                      component="div"
                      role="button"
                      tabIndex={0}
                      variant="subtle"
                      color="gray"
                      size="xs"
                      aria-label={`Rename ${c.title}`}
                      onClick={(e) => {
                        // Without this the click also opens the thread, and the
                        // field is replaced the instant it appears.
                        e.stopPropagation();
                        beginRename(c.id, c.title);
                      }}
                    >
                      <Pencil size={11} />
                    </ActionIcon>
                    <ActionIcon
                      component="div"
                      role="button"
                      tabIndex={0}
                      variant="subtle"
                      color="red"
                      size="xs"
                      aria-label={`Delete ${c.title}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        void deleteConversation(c.id).catch(() => {});
                      }}
                    >
                      <Trash2 size={11} />
                    </ActionIcon>
                  </div>
                </UnstyledButton>
              );
            })}
          </Stack>
        )}
      </ScrollArea>
    </Drawer>
  );
}
