import { useEffect, useMemo } from "react";
import {
  ReactFlow, ReactFlowProvider, MarkerType, useNodesState, useReactFlow,
  type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  BarChart3, MessageCircle, Mail, FileSpreadsheet, CalendarClock, Globe,
  Link as LinkIcon, Search, PenLine, CircleSlash, TriangleAlert,
  UserRound, AtSign, Smartphone,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Site } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { frequencyLabel, nextRunLabel } from "@/features/reports/pages/utils";
import { ReportFlowNode, type ReportFlowNodeData } from "./ReportFlowNode";

const NODE_W = 208;
/** Vertical: stages run down the canvas, the items within a stage across it.
 *  Laid out horizontally the graph was five columns wide, so fitting it into
 *  the preview pane zoomed far enough out that the node text stopped being
 *  readable — downward, the long axis is the one the pane has to spare. */
const COL_W = 244;
const ROW_H = 150;

const nodeTypes = { report: ReportFlowNode };

/** Stages of the pipeline, top to bottom. */
const STAGE = { trigger: 0, scope: 1, section: 2, channel: 3, recipient: 4 };

/**
 * One colour per node, walked in order down the graph.
 *
 * Fixed hues rather than the theme accent: the accent is the user's own choice
 * and would collide with whichever entry matched it, and the point here is that
 * no two nodes share a colour. Ordered so neighbours in the pipeline are far
 * apart on the wheel.
 */
const HUES = [
  "#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#facc15",
  "#60a5fa", "#fb923c", "#2dd4bf", "#e879f9", "#4ade80",
];

const hueAt = (i: number) => HUES[i % HUES.length];

/** Centres a stage's items against the widest stage, so the pipeline reads as
 *  one vertical spine instead of every stage starting at the left edge. */
function laneX(index: number, count: number, widest: number) {
  return (index - (count - 1) / 2) * COL_W + ((widest - 1) / 2) * COL_W;
}

/**
 * The report draft drawn as a pipeline: when it fires, what it covers, what
 * goes in it, and where it lands.
 *
 * A schedule *is* a workflow — trigger, scope, a fan-out of content sections,
 * a fan-in to delivery channels — and the flat mock document hid that shape
 * behind a list of checkbox labels. Drawn as a graph, switching a section off
 * visibly removes a branch, and a schedule with no channel is a pipeline that
 * ends nowhere rather than a validation error found later.
 */
export function ReportFlowPreview(props: {
  draft: Draft;
  sites: Site[];
  shareEnabled: boolean;
  /** The owner's WhatsApp number, shown as the destination of that channel —
   *  it is not in `recipients`, which holds the extra email addresses only. */
  ownerMobile?: string;
  /** Opens the form step that owns the clicked node. */
  onNavigate?: (tab: string) => void;
}) {
  // Its own provider: the dialog is not inside one, and `useReactFlow` below
  // needs the store to exist above the canvas to re-fit the viewport.
  return (
    <ReactFlowProvider>
      <ReportFlowCanvas {...props} />
    </ReactFlowProvider>
  );
}

function ReportFlowCanvas({
  draft,
  sites,
  shareEnabled,
  ownerMobile,
  onNavigate,
}: {
  draft: Draft;
  sites: Site[];
  shareEnabled: boolean;
  ownerMobile?: string;
  onNavigate?: (tab: string) => void;
}) {
  const { t } = useTranslation();

  const { nodes: initialNodes, edges } = useMemo(() => {
    const scopeNames = draft.siteIds.length
      ? sites.filter((s) => draft.siteIds.includes(s.siteId)).map((s) => s.name)
      : [t("reports.allSitesPlaceholder")];

    // Only sections actually switched on, in the order they appear in the
    // email — the same ordering the document itself uses.
    const sections = [
      draft.analytics && { id: "analytics", Icon: BarChart3, title: t("reports.includeAnalyticsLabel") },
      draft.aiSummary && draft.analytics && { id: "ai", Icon: PenLine, title: t("reports.includeAiLabel") },
      draft.seo && { id: "seo", Icon: Search, title: t("reports.includeSeoLabel") },
      draft.attachXlsx && { id: "xlsx", Icon: FileSpreadsheet, title: t("reports.includeXlsxLabel") },
      draft.dashboardLink && shareEnabled && { id: "link", Icon: LinkIcon, title: t("reports.includeLinkLabel") },
    ].filter(Boolean) as { id: string; Icon: typeof BarChart3; title: string }[];

    const channels = [
      draft.emailChannel && { id: "email", Icon: Mail, title: t("reports.channelEmail") },
      draft.whatsappChannel && { id: "whatsapp", Icon: MessageCircle, title: t("reports.channelWhatsApp") },
    ].filter(Boolean) as { id: string; Icon: typeof Mail; title: string }[];

    // Every section can be switched off, and a schedule with no channel never
    // sends. Both are real states, so each gets a node saying so rather than
    // an empty gap in the graph.
    const sectionNodes = sections.length
      ? sections
      : [{ id: "none", Icon: CircleSlash, title: t("reports.previewFlowNothing", "Nothing included") }];
    const channelNodes = channels.length
      ? channels
      : [{ id: "nochannel", Icon: TriangleAlert, title: t("reports.previewNoChannel") }];

    // Who actually receives it, per channel. The owner is added server-side on
    // every save and is not in `draft.recipients`, so it is stated here rather
    // than leaving the graph implying the extra addresses are the whole list.
    const recipients: { id: string; Icon: typeof Mail; title: string; from: string }[] = [];
    if (draft.emailChannel) {
      recipients.push({
        id: "owner-email",
        Icon: UserRound,
        title: t("reports.previewFlowYou", "You (workspace owner)"),
        from: "channel-email",
      });
      for (const email of draft.recipients) {
        recipients.push({ id: `to-${email}`, Icon: AtSign, title: email, from: "channel-email" });
      }
    }
    if (draft.whatsappChannel) {
      recipients.push({
        id: "owner-wa",
        Icon: Smartphone,
        title: ownerMobile || t("reports.previewFlowNoNumber", "No number on file"),
        from: "channel-whatsapp",
      });
    }

    const widest = Math.max(sectionNodes.length, channelNodes.length, recipients.length, 1);
    // Hues are handed out in pipeline order, so an edge can be painted with its
    // source node's colour and the two read as the same strand.
    const sectionHue = (i: number) => hueAt(2 + i);
    const channelHue = (i: number) => hueAt(2 + sectionNodes.length + i);
    const recipientHue = (i: number) =>
      hueAt(2 + sectionNodes.length + channelNodes.length + i);

    const nodes: Node[] = [
      {
        id: "trigger",
        type: "report",
        position: { x: laneX(0, 1, widest), y: STAGE.trigger * ROW_H },
        width: NODE_W,
        data: {
          kind: "trigger",
          Icon: CalendarClock,
          kicker: t("reports.previewFlowTrigger", "Trigger"),
          title: frequencyLabel(draft.frequency),
          // The actual next fire time, in the reader's timezone. "Weekly" alone
          // left the one thing people check — when does this land — unanswered
          // until after the first send.
          detail: draft.enabled
            ? nextRunLabel(draft.frequency)
            : t("reports.previewPaused"),
          live: draft.enabled,
          warn: !draft.enabled,
          hue: hueAt(0),
          tab: "schedule",
        } satisfies ReportFlowNodeData,
      },
      {
        id: "scope",
        type: "report",
        position: { x: laneX(0, 1, widest), y: STAGE.scope * ROW_H },
        width: NODE_W,
        data: {
          kind: "scope",
          Icon: Globe,
          kicker: t("reports.previewFlowScope", "Scope"),
          title: scopeNames[0],
          detail: scopeNames.length > 1
            ? `+${scopeNames.length - 1} ${t("reports.previewFlowMoreSites", "more")}`
            : undefined,
          hue: hueAt(1),
          tab: "schedule",
        } satisfies ReportFlowNodeData,
      },
      ...sectionNodes.map((s, i) => ({
        id: `section-${s.id}`,
        type: "report",
        position: { x: laneX(i, sectionNodes.length, widest), y: STAGE.section * ROW_H },
        width: NODE_W,
        data: {
          kind: sections.length ? "section" : "empty",
          Icon: s.Icon,
          kicker: t("reports.previewFlowSection", "Content"),
          title: s.title,
          warn: !sections.length,
          hue: sectionHue(i),
          tab: "content",
        } satisfies ReportFlowNodeData,
      })),
      ...channelNodes.map((c, i) => ({
        id: `channel-${c.id}`,
        type: "report",
        position: { x: laneX(i, channelNodes.length, widest), y: STAGE.channel * ROW_H },
        width: NODE_W,
        data: {
          kind: channels.length ? "channel" : "empty",
          Icon: c.Icon,
          kicker: t("reports.previewFlowDelivery", "Delivery"),
          title: c.title,
          warn: !channels.length,
          hue: channelHue(i),
          tab: "delivery",
        } satisfies ReportFlowNodeData,
      })),
      ...recipients.map((r, i) => ({
        id: `recipient-${r.id}`,
        type: "report",
        position: { x: laneX(i, recipients.length, widest), y: STAGE.recipient * ROW_H },
        width: NODE_W,
        data: {
          kind: "recipient",
          Icon: r.Icon,
          kicker: t("reports.previewFlowRecipients", "Recipients"),
          title: r.title,
          hue: recipientHue(i),
          tab: "delivery",
        } satisfies ReportFlowNodeData,
      })),
    ];

    // Dashed travelling edges: the point of the picture is that data moves
    // along it on a schedule, and a static line reads as a diagram of
    // structure rather than of a run.
    // Each edge is painted in the colour of the node it leaves, so a branch can
    // be followed across the fan-out by colour instead of by tracing the line.
    const edge = (
      id: string,
      source: string,
      target: string,
      hue: string,
      dim?: boolean,
    ): Edge => {
      const stroke = dim ? "var(--border-strong)" : hue;
      return {
        id,
        source,
        target,
        type: "smoothstep",
        animated: !dim,
        style: { stroke, strokeWidth: dim ? 1.2 : 1.6 },
        markerEnd: { type: MarkerType.ArrowClosed, color: stroke, width: 13, height: 13 },
      };
    };

    const dimSections = !sections.length;
    const dimChannels = !channels.length;
    const edges: Edge[] = [
      edge("e-trigger-scope", "trigger", "scope", hueAt(0), !draft.enabled),
      ...sectionNodes.map((s, i) =>
        edge(`e-scope-${s.id}`, "scope", `section-${s.id}`, sectionHue(i), dimSections),
      ),
      // Each section feeds every channel: the whole document goes out on each
      // one, so a per-channel subset would be a lie about what is sent.
      ...sectionNodes.flatMap((s, i) =>
        channelNodes.map((c) =>
          edge(
            `e-${s.id}-${c.id}`,
            `section-${s.id}`,
            `channel-${c.id}`,
            sectionHue(i),
            dimSections || dimChannels,
          ),
        ),
      ),
      // The last hop: which addresses each channel actually delivers to.
      ...recipients.map((r, i) =>
        edge(`e-${r.from}-${r.id}`, r.from, `recipient-${r.id}`, recipientHue(i)),
      ),
    ];

    return { nodes, edges };
  }, [draft, sites, shareEnabled, ownerMobile, t]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);

  // The draft changes on every keystroke and checkbox, so the graph is rebuilt
  // rather than patched — it is a handful of nodes, and reconciling would only
  // add a way for the picture to disagree with the form.
  useEffect(() => setNodes(initialNodes), [initialNodes, setNodes]);

  // `fitView` on the canvas only runs at mount, so toggling a section on would
  // otherwise drop a branch outside the framing that was fitted without it.
  const { fitView } = useReactFlow();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      void fitView({ padding: 0.18, duration: 260 });
    });
    return () => cancelAnimationFrame(id);
  }, [initialNodes, fitView]);

  return (
    <div className="report-flow-canvas">
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.3}
        // Above 1 so a short pipeline (one section, one channel) fills the pane
        // instead of sitting small in the middle of it.
        maxZoom={1.6}
        nodesDraggable
        nodesConnectable={false}
        edgesFocusable={false}
        panOnScroll
        // Clicking a node opens the step that owns it, which is what makes the
        // graph a way through the form rather than an illustration beside it.
        onNodeClick={(_, node) => {
          const tab = (node.data as ReportFlowNodeData).tab;
          if (tab) onNavigate?.(tab);
        }}
        proOptions={{ hideAttribution: true }}
      />
      {/* No <Background>: the preview pane already paints the grid this canvas
          sits on, and a second one stacked on top read as moiré. */}
    </div>
  );
}
