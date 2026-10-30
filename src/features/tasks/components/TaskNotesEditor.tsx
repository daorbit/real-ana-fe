import { useEffect, useRef } from "react";
import { RichTextEditor } from "@mantine/tiptap";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CharacterCount from "@tiptap/extension-character-count";
import "@mantine/tiptap/styles.css";
import { editorContent } from "../lib/taskNotes";
import classes from "./Tasks.module.css";

export function TaskNotesEditor({
  value,
  readOnly,
  onChange,
  onBlur,
}: {
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
  onBlur: () => void;
}) {
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  onChangeRef.current = onChange;
  onBlurRef.current = onBlur;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ link: { openOnClick: false } }),
      CharacterCount.configure({ limit: 4000, mode: "textSize" }),
    ],
    content: editorContent(value),
    editable: !readOnly,
    editorProps: { attributes: { "aria-label": "Task notes" } },
    onUpdate: ({ editor: current }) => {
      onChangeRef.current(current.isEmpty ? "" : current.getHTML());
    },
    onBlur: () => onBlurRef.current(),
  });

  useEffect(() => {
    if (editor) editor.setEditable(!readOnly);
  }, [editor, readOnly]);

  useEffect(() => {
    if (!editor) return;
    const content = editorContent(value);
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [editor, value]);

  return (
    <RichTextEditor
      editor={editor}
      classNames={{
        root: classes.notesEditor,
        toolbar: classes.notesToolbar,
        content: classes.notesContent,
      }}
    >
      {!readOnly && (
        <RichTextEditor.Toolbar aria-label="Notes formatting">
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold />
            <RichTextEditor.Italic />
            <RichTextEditor.Underline />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList />
            <RichTextEditor.OrderedList />
            <RichTextEditor.Blockquote />
            <RichTextEditor.Link />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo />
            <RichTextEditor.Redo />
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
      )}
      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
