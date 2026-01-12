# Genealogy tree: under the hood

This document explains how the genealogy tree is built, laid out, and rendered.

## Libraries used
- @dagrejs/dagre: graph layout engine. It takes nodes and edges plus sizing
  hints and produces x/y positions.
- @xyflow/react (React Flow): interactive graph renderer for the browser. It
  handles zoom, pan, minimap, background grid, and custom node rendering.

## Data flow overview
1. Page entry: `/tree` (app/tree/page.tsx) loads `GenealogyExplorer` if the user
   can access genealogy data.
2. Client fetch: `GenealogyExplorer` requests
   `/api/tree?id=...&direction=...&depth=...`.
3. API assembly: `app/api/tree/route.ts` loads the focus person, walks the
   genealogy data, and returns nodes + edges.
4. Client layout + render: `GenealogyFlow` trims/organizes the graph, runs
   Dagre for layout, and renders via React Flow.

## API: building the graph
File: `app/api/tree/route.ts`

- Auth: blocks requests unless `canAccessGenealogy` returns true.
- Input params:
  - `id`: focus person (required).
  - `direction`: `asc` or `desc` (default `desc`).
  - `depth`: max depth (capped to 1..6).
- Data sources:
  - `genea`: people records (name, birth, death, parents).
  - `genea2`: marriage links used for spouse lookup.
- Traversal:
  - `asc` (ascendancy): walk parents using `pere` and `mere`.
  - `desc` (descendancy): find marriages, add spouse edges, then fetch children
    for each couple and recurse.
- Deduping:
  - `nodeMap` ensures one node per person.
  - `addEdge` prevents duplicate spouse edges in reverse order.
- Output:
  - `nodes`: formatted person records.
  - `edges`: `parent` (parent -> child) and `spouse` (bidirectional).
  - `focusId`: echoed as a string.

## Client: preparing the graph
File: `app/components/tree/GenealogyFlow.tsx`

- `buildSubgraph` builds adjacency maps from the API edges and performs a
  breadth-first walk from the focus node so the UI stays within the requested
  depth and direction. Spouse edges are treated as undirected.
- Node sizing is fixed:
  - Width: 240
  - Height: 120
- Edge styles:
  - `parent`: default edge, coral stroke, thicker line.
  - `spouse`: smoothstep edge, dashed, animated, sky stroke.

## Layout: Dagre
File: `app/components/tree/GenealogyFlow.tsx`

- Dagre graph config:
  - `rankdir`:
    - `BT` for ascendancy (parents above).
    - `TB` for descendancy (children below).
  - `nodesep`: 40
  - `ranksep`: 120
- After `dagre.layout`, node centers are converted to React Flow positions by
  subtracting half the node width/height.

## Rendering: React Flow
Files:
- `app/components/tree/GenealogyFlow.tsx`
- `app/tree/GenealogyExplorer.tsx`

- `ReactFlowProvider` supplies shared state.
- `fitView` runs on load to frame all nodes.
- A second effect recenters on the focus node.
- `PersonCard` renders each node (name, dates, note, tags).
- Users can pan/zoom, use the minimap, and click a person from the list or
  mobile sheet to change the focus.
