import { useEffect, useMemo } from "react";
import {
  ReactFlow, ReactFlowProvider, MarkerType, useNodesState, useReactFlow,
  type Node, type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  BarChart3, MessageCircle, Mail, FileSpreadsheet, CalendarClock, Globe,
  Link as LinkIcon, Search, PenLine, CircleSlash, TriangleAlert,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { Site } from "@/shared/types";
import type { Draft } from "@/features/reports/pages/types";
import { frequencyLabel } from "@/features/reports/pages/utils";
import { ReportFlowNode, type ReportFlowNodeData } from "./ReportFlowNode";

const NODE_W = 208;
const COL_W = 280;
const ROW_H = 96;

const nodeTypes = { report: ReportFlowNode };

/** Columns of the pipeline, left to right. */
const COL = { trigger: 0, scope: 1, section: 2, channel: 3 };

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

/** Centres a column's rows against the tallest column, so the pipeline reads as
 *  one horizontal band instead of every column starting at the top. */
function laneY(index: number, count: number, tallest: number) {
  return (index - (count - 1) / 2) * ROW_H + ((tallest - 1) / 2) * ROW_H;
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
}: {
  draft: Draft;
  sites: Site[];
  shareEnabled: boolean;
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

    const tallest = Math.max(sectionNodes.length, channelNodes.length, 1);

    const recipientCount = draft.recipients.length;
    // Hues are handed out in pipeline order, so an edge can be painted with its
    // source node's colour and the two read as the same strand.
    const sectionHue = (i: number) => hueAt(2 + i);
    const channelHue = (i: number) => hueAt(2 + sectionNodes.length + i);

    const nodes: Node[] = [
      {
        id: "trigger",
        type: "report",
        position: { x: COL.trigger * COL_W, y: laneY(0, 1, tallest) },
        width: NODE_W,
        data: {
          kind: "trigger",
          Icon: CalendarClock,
          kicker: t("reports.previewFlowTrigger", "Trigger"),
          title: frequencyLabel(draft.frequency),
          detail: draft.name.trim() || t("reports.namePlaceholder"),
          live: draft.enabled,
          warn: !draft.enabled,
          hue: hueAt(0),
        } satisfies ReportFlowNodeData,
      },
      {
        id: "scope",
        type: "report",
        position: { x: COL.scope * COL_W, y: laneY(0, 1, tallest) },
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
        } satisfies ReportFlowNodeData,
      },
      ...sectionNodes.map((s, i) => ({
        id: `section-${s.id}`,
        type: "report",
        position: { x: COL.section * COL_W, y: laneY(i, sectionNodes.length, tallest) },
        width: NODE_W,
        data: {
          kind: sections.length ? "section" : "empty",
          Icon: s.Icon,
          kicker: t("reports.previewFlowSection", "Content"),
          title: s.title,
          warn: !sections.length,
          hue: sectionHue(i),
        } satisfies ReportFlowNodeData,
      })),
      ...channelNodes.map((c, i) => ({
        id: `channel-${c.id}`,
        type: "report",
        position: { x: COL.channel * COL_W, y: laneY(i, channelNodes.length, tallest) },
        width: NODE_W,
        data: {
          kind: channels.length ? "channel" : "empty",
          Icon: c.Icon,
          kicker: t("reports.previewFlowDelivery", "Delivery"),
          title: c.title,
          detail: channels.length && recipientCount
            ? `${recipientCount} ${t("reports.previewFlowRecipients", "recipients")}`
            : undefined,
          warn: !channels.length,
          hue: channelHue(i),
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
        pathOptions: { borderRadius: 16 },
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
    ];

    return { nodes, edges };
  }, [draft, sites, shareEnabled, t]);

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
        maxZoom={1.3}
        nodesDraggable
        nodesConnectable={false}
        edgesFocusable={false}
        panOnScroll
        proOptions={{ hideAttribution: true }}
      />
      {/* No <Background>: the preview pane already paints the grid this canvas
          sits on, and a second one stacked on top read as moiré. */}
    </div>
  );
}
