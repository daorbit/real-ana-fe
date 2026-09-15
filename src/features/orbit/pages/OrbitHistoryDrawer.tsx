import { useState } from "react";
import {
  ActionIcon, Box, Button, Drawer, Group, Loader, Modal, ScrollArea, Stack,
  Text, TextInput, UnstyledButton,
} from "@mantine/core";
import { AlertTriangle, Check, MessageSquare, Pencil, Plus, Trash2, X } from "lucide-react";
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
    renameConversation, loadingConversation, loadingConversations, reset, started,
  } = chat;

  /** The row being renamed, and the text so far. Only ever one at a time. */
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  /** The row asking "are you sure?" before it deletes anything. */
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const beginRename = (id: string, title: string) => {
    setConfirmingDelete(null);
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

  const confirmTitle = conversations.find((c) => c.id === confirmingDelete)?.title ?? "";

  const confirmDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteConversation(id);
    } catch {
      // Left in the list — the truth until the next fetch.
    } finally {
      setDeletingId(null);
      setConfirmingDelete(null);
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

  const close = () => {
    setEditing(null);
    setConfirmingDelete(null);
    onClose();
  };

  return (
    <Drawer
      opened={opened}
      onClose={close}
      position="right"
      size={320}
      padding={0}
      withCloseButton={false}
      // The rail stays reachable behind the overlay, and the drawer is a
      // sideshow rather than a mode — a heavy scrim would say otherwise.
      overlayProps={{ backgroundOpacity: 0.35, blur: 2 }}
      title={null}
      classNames={{ content: classes.drawerContent }}
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
          <ActionIcon variant="subtle" color="gray" size="sm" onClick={close} aria-label="Close history">
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
        {loadingConversations ? (
          <Stack gap={0}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={classes.threadSkeleton}>
                <div className={classes.threadSkeletonIcon} />
                <div className={classes.threadSkeletonLines}>
                  <div className={classes.threadSkeletonLine} />
                  <div className={classes.threadSkeletonLine} data-w="short" />
                </div>
              </div>
            ))}
          </Stack>
        ) : !conversations.length ? (
          <Text size="xs" c="dimmed" lh={1.5} px={10} py={6}>
            Threads you start are saved here for everyone in this workspace.
          </Text>
        ) : (
          <Stack gap={0}>
            {conversations.map((c) => {
              const active = c.id === conversationId;

              if (editing === c.id) {
                return (
                  <Box key={c.id} px={4} py={4} mb={4}>
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

              const deleting = deletingId === c.id;

              return (
                <UnstyledButton
                  key={c.id}
                  className={classes.thread}
                  data-active={active}
                  data-deleting={deleting || undefined}
                  onClick={() => pick(c.id)}
                >
                  <div className={classes.threadIcon}>
                    {deleting ? <Loader size={13} color="red" /> : <MessageSquare size={14} />}
                  </div>

                  <div className={classes.threadBody}>
                    <Text size="xs" fw={active ? 600 : 500} lh={1.4} truncate>
                      {c.title}
                    </Text>
                    <Text size="10px" c="dimmed" lh={1.4}>
                      {ago(c.lastMessageAt)} · {Math.floor(c.messageCount / 2)} question
                      {c.messageCount === 2 ? "" : "s"}
                    </Text>
                  </div>

                  {/* Hidden until the row is hovered or focused — see the CSS.
                      Divs, not nested buttons: the row itself is the button
                      that opens the thread. */}
                  {!deleting && (
                    <div className={classes.threadActions}>
                      <ActionIcon
                        component="div"
                        role="button"
                        tabIndex={0}
                        variant="subtle"
                        className={classes.threadActionBtn}
                        data-tone="edit"
                        aria-label={`Rename ${c.title}`}
                        onClick={(e) => {
                          // Without this the click also opens the thread, and
                          // the field is replaced the instant it appears.
                          e.stopPropagation();
                          beginRename(c.id, c.title);
                        }}
                      >
                        <Pencil size={12} />
                      </ActionIcon>
                      <ActionIcon
                        component="div"
                        role="button"
                        tabIndex={0}
                        variant="subtle"
                        className={classes.threadActionBtn}
                        data-tone="delete"
                        aria-label={`Delete ${c.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditing(null);
                          setConfirmingDelete(c.id);
                        }}
                      >
                        <Trash2 size={12} />
                      </ActionIcon>
                    </div>
                  )}
                </UnstyledButton>
              );
            })}
          </Stack>
        )}
      </ScrollArea>

      {/* Its own modal rather than a card squeezed into the list: the list
          keeps its row height stable and the choice gets the same weight any
          other destructive confirmation in the app gets. */}
      <Modal
        opened={confirmingDelete != null}
        onClose={() => !deletingId && setConfirmingDelete(null)}
        withCloseButton={false}
        centered
        size={340}
        radius="md"
        overlayProps={{ backgroundOpacity: 0.45, blur: 2 }}
      >
        <Stack gap={4} align="center" ta="center" py={4}>
          <Box className={classes.confirmIcon}>
            <AlertTriangle size={20} />
          </Box>
          <Text size="sm" fw={650}>
            Delete this conversation?
          </Text>
          <Text size="xs" c="dimmed" lh={1.5} maw={260}>
            {confirmTitle ? <>&ldquo;{confirmTitle}&rdquo; and all its messages will be gone for everyone in this workspace. This can&apos;t be undone.</> : null}
          </Text>
          <Group gap={8} mt={14} w="100%" grow>
            <Button
              variant="default"
              onClick={() => setConfirmingDelete(null)}
              disabled={!!deletingId}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={!!deletingId}
              onClick={() => confirmingDelete && void confirmDelete(confirmingDelete)}
            >
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Drawer>
  );
}
