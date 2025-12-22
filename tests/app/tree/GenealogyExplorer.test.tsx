import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";

const mockGenealogyFlow = vi.fn(() => <div data-testid="flow" />);

vi.mock("@/app/components/tree/GenealogyFlow", () => ({
  GenealogyFlow: mockGenealogyFlow,
}));

const copy = {
  quickSearch: "Quick search",
  searchPlaceholder: "Search people",
  letterJump: "Letters",
  allLabel: "All",
  peopleLabel: "People",
  noResults: "No results",
  tipsTitle: "Tips",
  tips: [],
  focusedPerson: "Focused person",
  ascendancy: "Asc",
  descendancy: "Desc",
  depth: "Depth",
  choosePerson: "Choose",
  loading: "Loading",
  errorPrefix: "Error:",
};

const sampleGraph = {
  nodes: [
    { id: "1", name: "Jean Dupont", familyName: "Dupont", birth: "1900", death: "1980" },
    { id: "2", name: "Marie Martin", familyName: "Martin", birth: "1905", death: "1988" },
    { id: "3", name: "Paul Durand", familyName: "Durand", birth: "1930", death: "2001" },
  ],
  edges: [],
};

describe("GenealogyExplorer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ data: { ...sampleGraph, focusId: "1" } }),
    }) as any;
  });

  test("fetches graph for initial person and renders flow with params", async () => {
    const { GenealogyExplorer } = await import("@/app/tree/GenealogyExplorer");

    render(<GenealogyExplorer lang="en" initialPersonId={1} copy={copy as any} />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/tree?id=1&direction=desc&depth=3",
      expect.any(Object),
    );
    await waitFor(() => expect(mockGenealogyFlow).toHaveBeenCalled());
    const call = mockGenealogyFlow.mock.calls[0]?.[0];
    expect(call).toMatchObject({
      graph: sampleGraph,
      focusId: "1",
      direction: "desc",
      maxDepth: 3,
      lang: "en",
    });
  });

  test("changing direction and depth triggers new fetch", async () => {
    const { GenealogyExplorer } = await import("@/app/tree/GenealogyExplorer");
    render(<GenealogyExplorer lang="en" initialPersonId={1} copy={copy as any} />);

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByText("Asc"));
    fireEvent.change(screen.getByRole("slider"), { target: { value: "5" } });

    await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(3));
    const urls = (global.fetch as vi.Mock).mock.calls.map((c) => c[0] as string);
    expect(urls).toEqual(
      expect.arrayContaining([
        "/api/tree?id=1&direction=asc&depth=3",
        "/api/tree?id=1&direction=asc&depth=5",
      ]),
    );
  });

  test("filters sidebar list by query and letter", async () => {
    const { GenealogyExplorer } = await import("@/app/tree/GenealogyExplorer");
    render(<GenealogyExplorer lang="en" initialPersonId={1} copy={copy as any} />);

    await waitFor(() => expect(screen.getAllByText("Jean Dupont")[0]).toBeInTheDocument());
    expect(screen.getAllByText("Marie Martin")[0]).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Search people"), {
      target: { value: "mar" },
    });
    fireEvent.click(screen.getByText("M"));

    const peopleList = screen.getByText("People").parentElement?.querySelector("div.space-y-1");
    expect(within(peopleList as HTMLElement).queryAllByText("Jean Dupont")).toHaveLength(0);
    expect(within(peopleList as HTMLElement).getAllByText("Marie Martin")[0]).toBeInTheDocument();
  });

  test("shows error status when fetch fails", async () => {
    (global.fetch as vi.Mock).mockRejectedValueOnce(new Error("boom"));
    const { GenealogyExplorer } = await import("@/app/tree/GenealogyExplorer");
    render(<GenealogyExplorer lang="en" initialPersonId={1} copy={copy as any} />);

    await waitFor(() => expect(screen.getByText(/Error:/)).toBeInTheDocument());
  });
});
