import { ActionIcon, Badge, Button, Menu, UnstyledButton } from "@mantine/core";
import {
  ExternalLink, ImageIcon, MoreHorizontal, Pause, Pencil, Play, Send, Trash2,
} from "lucide-react";
import { STAGE_COLOR, STAGE_LABEL, stageOf } from "../postStatus";
import type { ScheduledPost } from "@/shared/types";
import classes from "./SocialQueue.module.css";

function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function metaLine(post: ScheduledPost, author: string): string {
  const instagram = post.provider === "instagram";
  const network = instagram ? "Instagram" : "LinkedIn";
  const format = instagram ? (post.format === "story" ? "Story" : "Feed post") : "";
  return [network, format, author].filter(Boolean).join(" · ");
}

export function PostRow({
  post,
  author,
  onEdit,
  onToggle,
  onDelete,
  onPublish,
  publishingId,
  recentlyMovedId,
}: {
  post: ScheduledPost;
  author: string;
  onEdit: (post: ScheduledPost) => void;
  onToggle: (post: ScheduledPost) => void;
  onDelete: (post: ScheduledPost) => void;
  onPublish: (post: ScheduledPost) => void;
  publishingId: string | null;
  recentlyMovedId?: string | null;
}) {
  const stage = stageOf(post);
  const failed = stage === "failed";
  const sent = post.status === "sent";
  const draft = post.status === "paused";
  const moved = recentlyMovedId === post.id;
  const networkName = post.provider === "instagram" ? "Instagram" : "LinkedIn";

  return (
    <div className={classes.post} data-moved={moved || undefined}>
      <UnstyledButton className={classes.postMain} onClick={() => onEdit(post)}>
        <span className={classes.postTime}>
          {post.mode === "repeat" ? "Repeats" : clock(post.nextRunAt)}
          {post.mode === "repeat" && <span className={classes.postFrequency}>{post.frequency}</span>}
        </span>
        <span className={classes.thumb} aria-hidden>
          {post.imageUrl ? (
            <img className={classes.thumbImage} src={post.imageUrl} alt="" />
          ) : (
            <ImageIcon size={22} strokeWidth={1.6} />
          )}
        </span>
        <span className={classes.postText}>
          <span className={classes.postName}>{post.name}</span>
          {post.caption && <span className={classes.postCaption}>{post.caption}</span>}
          <span className={classes.postMeta} data-failed={failed || undefined}>
            {failed && post.lastError ? post.lastError : metaLine(post, author)}
          </span>
        </span>
      </UnstyledButton>

      <div className={classes.postActions}>
        {moved && <Badge size="sm" variant="light">Moved</Badge>}
        {(draft || failed) && (
          <Badge size="sm" variant="light" color={STAGE_COLOR[stage]}>
            {STAGE_LABEL[stage]}
          </Badge>
        )}
        {failed && (
          <Button variant="default" size="xs" radius={10} onClick={() => onEdit(post)}>
            Reschedule
          </Button>
        )}
        <Menu position="bottom-end" withinPortal shadow="md" width={190}>
          <Menu.Target>
            <ActionIcon
              variant="subtle"
              color="gray"
              size={32}
              radius={10}
              loading={publishingId === post.id}
              aria-label={`Actions for ${post.name}`}
            >
              <MoreHorizontal size={17} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item leftSection={<Send size={14} />} onClick={() => onPublish(post)}>
              Publish now
            </Menu.Item>
            <Menu.Item leftSection={<Pencil size={14} />} onClick={() => onEdit(post)}>
              {sent ? "Reschedule" : "Edit"}
            </Menu.Item>
            {post.lastPostUrl && (
              <Menu.Item
                component="a"
                href={post.lastPostUrl}
                target="_blank"
                rel="noopener noreferrer"
                leftSection={<ExternalLink size={14} />}
              >
                View on {networkName}
              </Menu.Item>
            )}
            {!sent && (
              <Menu.Item
                leftSection={draft ? <Play size={14} /> : <Pause size={14} />}
                onClick={() => onToggle(post)}
              >
                {draft ? "Schedule it" : "Move to drafts"}
              </Menu.Item>
            )}
            <Menu.Divider />
            <Menu.Item color="red" leftSection={<Trash2 size={14} />} onClick={() => onDelete(post)}>
              Delete
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </div>
  );
}
