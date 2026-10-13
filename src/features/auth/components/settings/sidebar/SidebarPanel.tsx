import { Text } from "@mantine/core";
import { Lock } from "lucide-react";
import { useWorkspace } from "@/features/workspace/context";
import { PinnedSection } from "./PinnedSection";
import { LinksSection } from "./LinksSection";
import { PagesTable } from "./PagesTable";
import { useNavPrefsEditor } from "./useNavPrefsEditor";
import classes from "./Sidebar.module.css";

export function SidebarPanel() {
  const { active } = useWorkspace();
  const editor = useNavPrefsEditor();
  const workspaceName = active?.name ?? "this workspace";

  return (
    <div className={classes.page}>
      {!editor.editable && (
        <div className={classes.notice}>
          <Lock size={14} />
          <Text size="sm">
            This sidebar is shared by everyone in {workspaceName}. Only workspace admins can change it.
          </Text>
        </div>
      )}

      <div className={classes.layout}>
        <PagesTable editor={editor} />
        <aside className={classes.aside}>
          <PinnedSection editor={editor} workspaceName={workspaceName} />
          <LinksSection editor={editor} />
        </aside>
      </div>
    </div>
  );
}
