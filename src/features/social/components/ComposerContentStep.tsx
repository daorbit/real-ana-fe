import type { RefObject } from "react";
import {
  Box, Button, Group, RingProgress, SegmentedControl, Text, TextInput, Tooltip,
} from "@mantine/core";
import { PenLine } from "lucide-react";
import {
  CaptionEditor, CaptionToolbar, type CaptionEditorHandle,
} from "@/shared/components/CaptionEditor";
import { PostImageField } from "./PostImageField";
import { ComposerField } from "./ComposerField";
import { MAX_HASHTAGS, type Draft } from "./draft";
import { InstagramMark, LinkedInMark } from "@/shared/ui/LinkedInMark";

/**
 * Step one: what the post says.
 *
 * Everything here is the post itself — name, text, image. When it goes out is
 * the next step's question, and keeping the two apart is what stops someone
 * picking a time before they know what they are scheduling.
 */
export function ComposerContentStep({
  draft,
  patch,
  editor,
  topic,
  onTopic,
  onGenerate,
  writing,
  chars,
  tags,
  overLimit,
  limit,
  needsImage,
  lockProvider,
  planner,
}: {
  draft: Draft;
  patch: (next: Partial<Draft>) => void;
  editor: RefObject<CaptionEditorHandle | null>;
  /** What the post is about, in the author's words — the steer Orbit writes from. */
  topic: string;
  onTopic: (topic: string) => void;
  onGenerate: () => void;
  writing: boolean;
  chars: number;
  tags: number;
  overLimit: boolean;
  /** The caption cap for the chosen network. */
  limit: number;
  /** An Instagram post with no image, which cannot be published. */
  needsImage: boolean;
  /** True when editing: the network is fixed for the life of a post. */
  lockProvider?: boolean;
  /** Orbit's scheduling conversation, rendered above the form it fills in. */
  planner?: React.ReactNode;
}) {
  return (
    <>
      {/* Above everything, because it is the shortcut past everything: whatever
          Orbit settles here lands in the fields below, where it is reviewed and
          corrected like anything typed by hand. */}
      {planner && <Box mb="lg">{planner}</Box>}

      {/* First of the fields, because it decides the rules everything below is
          written against — the caption cap and whether an image is required. */}
      <ComposerField
        label="Publish to"
        hint={lockProvider ? "Fixed after creating" : undefined}
      >
        <SegmentedControl
          fullWidth
          disabled={lockProvider}
          value={draft.provider}
          onChange={(value) => patch({ provider: value as Draft["provider"] })}
          data={[
            {
              value: "linkedin",
              label: (
                <Group gap={6} justify="center" wrap="nowrap">
                  <LinkedInMark size={14} />
                  <span>LinkedIn</span>
                </Group>
              ),
            },
            {
              value: "instagram",
              label: (
                <Group gap={6} justify="center" wrap="nowrap">
                  <InstagramMark size={14} />
                  <span>Instagram</span>
                </Group>
              ),
            },
          ]}
        />
      </ComposerField>

      <ComposerField label="Name" hint="For your own list. Not published.">
        <TextInput
          placeholder="Weekly analytics update"
          value={draft.name}
          onChange={(e) => patch({ name: e.currentTarget.value })}
        />
      </ComposerField>

      <ComposerField label="Post" hint={`${tags}/${MAX_HASHTAGS} hashtags`}>
        {/* Say what the post is about and Orbit drafts it. A topic box rather
            than a bare "write for me" button: the post goes out under the
            author's own name, so the model is given their subject rather than
            left to guess one. Writing over an existing caption is deliberate —
            the button says "Rewrite" once there is something to lose. */}
        <Group gap="sm" mb="sm" wrap="nowrap" align="flex-end">
          <TextInput
            placeholder="What is this post about?"
            value={topic}
            onChange={(e) => onTopic(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && topic.trim() && !writing) {
                e.preventDefault();
                onGenerate();
              }
            }}
            style={{ flex: 1 }}
          />
          <Tooltip
            label={
              topic.trim()
                ? "Orbit writes the post from this. Costs one Orbit question."
                : "Say what the post is about first"
            }
            withArrow
          >
            <Box>
              <Button
                variant="light"
                color="emerald"
                loading={writing}
                disabled={!topic.trim()}
                onClick={onGenerate}
                leftSection={<PenLine size={15} />}
              >
                {draft.caption.trim() ? "Rewrite" : "Write with Orbit"}
              </Button>
            </Box>
          </Tooltip>
        </Group>

        <Box
          style={{
            border: `1px solid ${overLimit ? "var(--mantine-color-red-5)" : "var(--mantine-color-default-border)"}`,
            borderRadius: "var(--mantine-radius-md)",
            overflow: "hidden",
          }}
        >
          <CaptionToolbar editor={editor} />
          <CaptionEditor
            value={draft.caption}
            onChange={(caption) => patch({ caption })}
            handleRef={editor}
            ariaLabel="Post text"
          />
          {/* The counter sits inside the field rather than under it: at 3000
              characters the limit is far away most of the time, and a ring
              shows how far without reading a number. */}
          <Group
            justify="space-between"
            align="center"
            px={12}
            py={6}
            wrap="nowrap"
            style={{ borderTop: "1px solid var(--mantine-color-default-border)" }}
          >
            <Text size="xs" c="dimmed">
              Bold and italic are unicode characters — {draft.provider === "instagram"
                ? "Instagram"
                : "LinkedIn"} accepts no formatting.
            </Text>
            <Group gap={7} wrap="nowrap">
              <Text size="xs" c={overLimit ? "red" : "dimmed"}>
                {chars.toLocaleString()} / {limit.toLocaleString()}
              </Text>
              <RingProgress
                size={22}
                thickness={3}
                sections={[{
                  value: Math.min(100, (chars / limit) * 100),
                  color: overLimit ? "red" : chars > limit * 0.9 ? "orange" : "emerald",
                }]}
              />
            </Group>
          </Group>
        </Box>
      </ComposerField>

      <ComposerField
        label="Image"
        hint={draft.provider === "instagram" ? "Required" : "Optional"}
      >
        <PostImageField value={draft.image} onChange={(image) => patch({ image })} />
        {/* Instagram builds every post around a media container, so there is no
            text-only post to fall back to. Said beside the field rather than
            discovered when the save button will not respond. */}
        {needsImage && (
          <Text size="xs" c="red" mt={6}>
            Instagram posts need an image.
          </Text>
        )}
      </ComposerField>
    </>
  );
}
