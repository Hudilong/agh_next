'use client';

import { useEffect, useMemo } from 'react';
import dagre from '@dagrejs/dagre';
import {
  Background,
  Controls,
  Edge,
  Handle,
  MiniMap,
  Node,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import type { Locale } from '@/app/i18n';
import { msg } from '@/app/i18n';

export type PersonNode = {
  id: string;
  name: string;
  familyName?: string;
  birth?: string;
  death?: string;
  gender?: 'm' | 'f';
  tags?: string[];
  note?: string;
};

export type GenealogyEdge = {
  source: string;
  target: string;
  type: 'parent' | 'spouse';
};

export type GenealogyGraph = {
  nodes: PersonNode[];
  edges: GenealogyEdge[];
};

type FlowProps = {
  graph: GenealogyGraph;
  focusId: string;
  direction: 'asc' | 'desc';
  maxDepth: number;
  lang: Locale;
};

type FlowNodeData = {
  person: PersonNode;
  isFocus: boolean;
  lang: Locale;
};

type FlowEdgeData = {
  edgeType: 'parent' | 'spouse';
};

const nodeWidth = 240;
const nodeHeight = 120;
const fitPadding = 0.22;
const defaultFitZoom = 0.75;
const minZoom = 0.15;
const maxZoom = 1.6;

export function GenealogyFlow({
  graph,
  focusId,
  direction,
  maxDepth,
  lang,
}: FlowProps) {
  const { nodes, edges } = useMemo(() => {
    const subset = buildSubgraph(graph, focusId, direction, maxDepth);
    return layout(subset.nodes, subset.edges, direction, lang, focusId);
  }, [graph, focusId, direction, maxDepth, lang]);

  return (
    <div className="h-full rounded-2xl border border-white/70 bg-white/70 backdrop-blur-md shadow-card overflow-hidden">
      <ReactFlowProvider>
        <FlowCanvas focusId={focusId} nodes={nodes} edges={edges} />
      </ReactFlowProvider>
    </div>
  );
}

function buildSubgraph(
  graph: GenealogyGraph,
  focusId: string,
  direction: 'asc' | 'desc',
  maxDepth: number,
) {
  const nodesById = new Map(graph.nodes.map((p) => [p.id, p]));
  const parentsOf = new Map<string, string[]>();
  const childrenOf = new Map<string, string[]>();
  const spousesOf = new Map<string, string[]>();
  const edgeMap = new Map<string, GenealogyEdge>();

  graph.edges.forEach((e) => {
    edgeMap.set(`${e.type}:${e.source}->${e.target}`, e);
    if (e.type === 'parent') {
      const kids = childrenOf.get(e.source) ?? [];
      kids.push(e.target);
      childrenOf.set(e.source, kids);
      const pars = parentsOf.get(e.target) ?? [];
      pars.push(e.source);
      parentsOf.set(e.target, pars);
    } else {
      const a = spousesOf.get(e.source) ?? [];
      a.push(e.target);
      spousesOf.set(e.source, a);
      const b = spousesOf.get(e.target) ?? [];
      b.push(e.source);
      spousesOf.set(e.target, b);
    }
  });

  const queue: Array<{ id: string; depth: number }> = [{ id: focusId, depth: 0 }];
  const visited = new Set<string>();
  const seenEdges = new Set<string>();
  const subNodes: PersonNode[] = [];
  const subEdges: GenealogyEdge[] = [];

  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    const { id, depth } = current;
    if (visited.has(id)) continue;
    const person = nodesById.get(id);
    if (!person) continue;
    visited.add(id);
    subNodes.push(person);
    if (depth >= maxDepth) continue;

    const parents = parentsOf.get(id) ?? [];
    const children = childrenOf.get(id) ?? [];
    const spouses = spousesOf.get(id) ?? [];

    if (direction === 'asc') {
      parents.forEach((pid) => {
        addEdge(subEdges, seenEdges, edgeMap, pid, id, 'parent');
        if (!visited.has(pid)) queue.push({ id: pid, depth: depth + 1 });
      });
    } else {
      children.forEach((cid) => {
        addEdge(subEdges, seenEdges, edgeMap, id, cid, 'parent');
        if (!visited.has(cid)) queue.push({ id: cid, depth: depth + 1 });
      });
    }

    spouses.forEach((sid) => {
      addEdge(subEdges, seenEdges, edgeMap, id, sid, 'spouse');
      if (!visited.has(sid)) queue.push({ id: sid, depth });
    });
  }

  return { nodes: subNodes, edges: subEdges };
}

function addEdge(
  edges: GenealogyEdge[],
  seen: Set<string>,
  edgeMap: Map<string, GenealogyEdge>,
  source: string,
  target: string,
  type: 'parent' | 'spouse',
) {
  const forward = `${type}:${source}->${target}`;
  const backward = `${type}:${target}->${source}`;
  if (seen.has(forward) || seen.has(backward)) return;
  const edge = edgeMap.get(forward) ?? edgeMap.get(backward) ?? { source, target, type };
  edges.push(edge);
  seen.add(forward);
  seen.add(backward);
}

function layout(
  nodes: PersonNode[],
  edges: GenealogyEdge[],
  direction: 'asc' | 'desc',
  lang: Locale,
  focusId: string,
) {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: direction === 'asc' ? 'BT' : 'TB',
    nodesep: 40,
    ranksep: 120,
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((n) => g.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
  edges.forEach((e) => g.setEdge(e.source, e.target));
  dagre.layout(g);

  const rfNodes: Node<FlowNodeData>[] = nodes.map((n) => {
    const pos = g.node(n.id) || { x: 0, y: 0 };
    return {
      id: n.id,
      type: 'person',
      position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 },
      data: { person: n, isFocus: n.id === focusId, lang },
      draggable: false,
    };
  });

  const rfEdges: Edge<FlowEdgeData>[] = edges.map((e) => ({
    id: `${e.type}-${e.source}-${e.target}`,
    source: e.source,
    target: e.target,
    type: e.type === 'spouse' ? 'smoothstep' : 'default',
    animated: e.type === 'spouse',
    data: { edgeType: e.type },
    style:
      e.type === 'spouse'
        ? {
            stroke: 'rgb(var(--haiti-sky-rgb))',
            strokeDasharray: '6 3',
            opacity: 0.9,
          }
        : { stroke: 'rgb(var(--haiti-coral-rgb))', strokeWidth: 2.2 },
  }));

  return { nodes: rfNodes, edges: rfEdges };
}

function FlowCanvas({
  nodes,
  edges,
  focusId,
}: {
  nodes: Node<FlowNodeData>[];
  edges: Edge<FlowEdgeData>[];
  focusId: string;
}) {
  const instance = useReactFlow();

  useEffect(() => {
    if (!nodes.length) return;
    instance.fitView({ padding: fitPadding, maxZoom: defaultFitZoom, duration: 350 });
  }, [nodes, instance]);

  useEffect(() => {
    if (!focusId) return;
    const currentNodes = instance.getNodes();
    const target = currentNodes.find((n) => n.id === focusId);
    if (!target) return;
    const width = target.width ?? nodeWidth;
    const height = target.height ?? nodeHeight;
    const x = target.position.x + width / 2;
    const y = target.position.y + height / 2;
    instance.setCenter(x, y, {
      zoom: Math.min(instance.getZoom(), maxZoom),
      duration: 350,
    });
  }, [focusId, instance, nodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      minZoom={minZoom}
      maxZoom={maxZoom}
      fitView
      fitViewOptions={{ padding: fitPadding, maxZoom: defaultFitZoom }}
      defaultEdgeOptions={{ animated: false }}
      nodeTypes={{ person: PersonCard }}
      panOnScroll
      zoomOnScroll
      zoomOnPinch
      elementsSelectable
      proOptions={{ hideAttribution: true }}
    >
      <Background gap={16} size={1} color="rgba(15,50,87,0.07)" />
      <MiniMap
        pannable
        zoomable
        style={{ height: 140, width: 220, borderRadius: 12 }}
        className="!bg-white/80 !shadow-md !border !border-white/80 !backdrop-blur"
        nodeStrokeColor={(n) =>
          (n.data as FlowNodeData).isFocus
            ? 'rgb(var(--haiti-coral-rgb))'
            : 'rgb(var(--haiti-navy-rgb))'
        }
        nodeColor={() => 'rgb(var(--haiti-foam-rgb))'}
        maskColor="rgba(255,255,255,0.4)"
      />
      <Controls showFitView={false} position="bottom-left" />
    </ReactFlow>
  );
}

function PersonCard({ data }: NodeProps<FlowNodeData>) {
  const { person, isFocus, lang } = data;
  const dates =
    person.birth || person.death
      ? `${person.birth ?? '…'} – ${person.death ?? '…'}`
      : msg(lang, 'datesUnknown');
  const gradient =
    person.gender === 'f'
      ? 'from-haiti-foam via-white to-haiti-sand'
      : 'from-haiti-foam via-white to-white';
  return (
    <div
      className={`rounded-xl border shadow-sm h-full bg-gradient-to-br ${gradient} ${
        isFocus ? 'border-haiti-coral shadow-lg shadow-haiti-coral/25' : 'border-white/60'
      }`}
    >
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
      <Handle type="source" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      <div className="p-3 space-y-2">
        <div className="text-sm font-semibold text-haiti-navy leading-tight">
          {person.name}
        </div>
        <div className="text-xs text-haiti-ink/70">{dates}</div>
        {person.note && (
          <div className="text-[11px] text-haiti-ink/80 bg-white/70 border border-white/60 rounded-md px-2 py-1">
            {person.note}
          </div>
        )}
        <div className="flex flex-wrap gap-1.5">
          {person.tags?.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-[3px] rounded-full bg-white/80 border border-white/70 text-haiti-navy/80"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
