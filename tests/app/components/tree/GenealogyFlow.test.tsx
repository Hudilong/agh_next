import { render } from "@testing-library/react";

let lastFlowProps: any = null;

vi.mock("@xyflow/react", () => ({
  Background: () => null,
  Controls: () => null,
  Edge: () => null,
  Handle: () => null,
  MiniMap: () => null,
  Position: { Top: "top", Bottom: "bottom", Left: "left", Right: "right" },
  ReactFlowProvider: ({ children }: any) => children,
  ReactFlow: (props: any) => {
    lastFlowProps = props;
    return <div data-testid="flow" />;
  },
}));

vi.mock("@dagrejs/dagre", () => ({
  default: {
    graphlib: {
      Graph: class {
        nodesMap = new Map();
        edgesArr: Array<[string, string]> = [];
        setGraph() {}
        setDefaultEdgeLabel() {}
        setNode(id: string, data: any) {
          this.nodesMap.set(id, data);
        }
        setEdge(source: string, target: string) {
          this.edgesArr.push([source, target]);
        }
        node() {
          return { x: 0, y: 0 };
        }
      },
    },
    layout: vi.fn(),
  },
}));

const graph = {
  nodes: [
    { id: "1", name: "Jean" },
    { id: "2", name: "Marie", gender: "f" as const },
    { id: "3", name: "Paul" },
  ],
  edges: [
    { source: "1", target: "2", type: "spouse" as const },
    { source: "2", target: "1", type: "spouse" as const }, // duplicate spouse
    { source: "1", target: "3", type: "parent" as const },
  ],
};

describe("GenealogyFlow", () => {
  beforeEach(() => {
    lastFlowProps = null;
  });

  test("renders nodes/edges with spouse dedupe and styles", async () => {
    const { GenealogyFlow } = await import("@/app/components/tree/GenealogyFlow");
    render(
      <GenealogyFlow
        graph={graph}
        focusId="1"
        direction="desc"
        maxDepth={2}
        lang="en"
      />,
    );

    expect(lastFlowProps?.nodes).toHaveLength(3);
    const focusNode = lastFlowProps.nodes.find((n: any) => n.data.isFocus);
    expect(focusNode.id).toBe("1");

    const spouseEdges = lastFlowProps.edges.filter((e: any) => e.data.edgeType === "spouse");
    expect(spouseEdges).toHaveLength(1);
    expect(spouseEdges[0]).toMatchObject({
      type: "smoothstep",
      animated: true,
      style: expect.objectContaining({ strokeDasharray: "6 3" }),
    });

    const parentEdge = lastFlowProps.edges.find((e: any) => e.data.edgeType === "parent");
    expect(parentEdge?.source).toBe("1");
    expect(parentEdge?.target).toBe("3");
  });
});
