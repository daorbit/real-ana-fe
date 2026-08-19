import { useState } from "react";
import { useWriteShareCaptionMutation } from "@/app/store";
import { notify, errMessage } from "@/shared/lib/notify";

/**
 * Ask Orbit to write the post from a topic the author names.
 *
 * The topic is held here rather than on the draft: it is the instruction that
 * produced the caption, not part of the post, and saving it with the post would
 * store a prompt nobody asked to keep.
 */
export function useOrbitCaption({
  workspaceId,
  onCaption,
}: {
  workspaceId: string | undefined;
  onCaption: (caption: string) => void;
}) {
  const [topic, setTopic] = useState("");
  const [writeCaption, { isLoading: writing }] = useWriteShareCaptionMutation();

  const generate = async () => {
    if (!topic.trim() || !workspaceId) return;
    try {
      const res = await writeCaption({
        workspaceId,
        platform: "linkedin",
        topic: topic.trim(),
      }).unwrap();
      onCaption(res.caption);
    } catch (e) {
      notify.error(errMessage(e, "Orbit could not write that post."));
    }
  };

  return { topic, setTopic, generate, writing };
}
