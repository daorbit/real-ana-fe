import { Text } from "@mantine/core";
import { Lock } from "lucide-react";
import { NAV_GROUPS } from "@/app/shell/navItems";
import { useWorkspace } from "@/features/workspace/context";
import { PinnedSection } from "./PinnedSection";
import { LinksSection } from "./LinksSection";
import { PageGroups, PagesFoot } from "./PageGroups";
import { useNavPrefsEditor } from "./useNavPrefsEditor";
import classes from "./Sidebar.module.css";

const LEFT_GROUPS = NAV_GROUPS.slice(0, 1);
const RIGHT_GROUPS = NAV_GROUPS.slice(1);

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

      <div className={classes.columns}>
        <div className={classes.column}>
          <PinnedSection editor={editor} workspaceName={workspaceName} />
          <PageGroups editor={editor} groups={LEFT_GROUPS} />
        </div>
        <div className={classes.column}>
          <LinksSection editor={editor} />
          <PageGroups editor={editor} groups={RIGHT_GROUPS} />
          <PagesFoot editor={editor} />
        </div>
      </div>
    </div>
  );
}
