import type { GenealogyGraph } from "@/app/components/tree/GenealogyFlow";

const mockGetCurrentUser = vi.fn();
const mockCanAccessGenealogy = vi.fn();
const mockGeneaFindUnique = vi.fn();
const mockGeneaFindMany = vi.fn();
const mockGenea2FindMany = vi.fn();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  canAccessGenealogy: mockCanAccessGenealogy,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    genea: {
      findUnique: mockGeneaFindUnique,
      findMany: mockGeneaFindMany,
    },
    genea2: {
      findMany: mockGenea2FindMany,
    },
  },
}));

const makePerson = (overrides: Partial<any> = {}) => ({
  id: overrides.id ?? 1,
  prenom: overrides.prenom ?? null,
  nom: overrides.nom ?? null,
  date_naissance: overrides.date_naissance ?? null,
  date_mort: overrides.date_mort ?? null,
  sexe: overrides.sexe ?? null,
  pere: overrides.pere ?? null,
  mere: overrides.mere ?? null,
  commentaires: overrides.commentaires ?? null,
});

const seedGraph = () => {
  const people = new Map<number, any>([
    [1, makePerson({ id: 1, prenom: "Jean", nom: "Dupont", pere: 2, mere: 3, sexe: "m" })],
    [2, makePerson({ id: 2, prenom: "Pierre", nom: "Dupont", sexe: "m" })],
    [3, makePerson({ id: 3, prenom: "Marie", nom: "Durand", sexe: "f" })],
    [4, makePerson({ id: 4, prenom: "Louise", nom: "Martin", sexe: "f" })],
    [5, makePerson({ id: 5, prenom: "Paul", nom: "Dupont", pere: 1, mere: 4, sexe: "m" })],
  ]);
  const marriages = [{ id: 1, pere: 1, mere: 4 }];

  mockGeneaFindUnique.mockImplementation(async ({ where: { id } }) => people.get(id) ?? null);
  mockGenea2FindMany.mockImplementation(async ({ where: { OR } }) =>
    marriages.filter((m) =>
      OR.some((cond: any) => (cond.pere && m.pere === cond.pere) || (cond.mere && m.mere === cond.mere)),
    ),
  );
  mockGeneaFindMany.mockImplementation(async ({ where: { OR } }) =>
    Array.from(people.values()).filter((p) =>
      OR.some((cond: any) => p.pere === cond.pere && p.mere === cond.mere),
    ),
  );
};

describe("GET /api/tree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedGraph();
    mockGetCurrentUser.mockResolvedValue({ id: 1 });
    mockCanAccessGenealogy.mockReturnValue(true);
  });

  test("rejects when user cannot access genealogy", async () => {
    mockCanAccessGenealogy.mockReturnValue(false);
    const { GET } = await import("@/app/api/tree/route");
    const res = await GET(new Request("http://localhost/api/tree?id=1"));
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toBe("Unauthorized");
  });

  test("returns 400 for missing or invalid id", async () => {
    const { GET } = await import("@/app/api/tree/route");
    const res = await GET(new Request("http://localhost/api/tree?id=abc"));
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Missing or invalid id parameter");
  });

  test("returns 404 when focus person not found", async () => {
    mockGeneaFindUnique.mockResolvedValueOnce(null);
    const { GET } = await import("@/app/api/tree/route");
    const res = await GET(new Request("http://localhost/api/tree?id=999"));
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("Person not found");
  });

  test("builds descendant graph with spouse dedupe and clamped depth", async () => {
    const { GET } = await import("@/app/api/tree/route");
    const res = await GET(
      new Request("http://localhost/api/tree?id=1&direction=desc&depth=10"),
    );
    const body = (await res.json()) as { data: GenealogyGraph & { focusId: string } };

    expect(res.status).toBe(200);
    expect(body.data.focusId).toBe("1");
    expect(body.data.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining(["1", "4", "5"]),
    );
    const spouseEdges = body.data.edges.filter((e) => e.type === "spouse");
    expect(spouseEdges).toHaveLength(1);
    expect(spouseEdges[0]).toMatchObject({ source: "1", target: "4" });
    expect(body.data.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ source: "1", target: "5", type: "parent" }),
        expect.objectContaining({ source: "4", target: "5", type: "parent" }),
      ]),
    );
  });

  test("builds ascendant graph and stops at max depth lower bound", async () => {
    const { GET } = await import("@/app/api/tree/route");
    const res = await GET(
      new Request("http://localhost/api/tree?id=1&direction=asc&depth=0"),
    );
    const body = (await res.json()) as { data: GenealogyGraph & { focusId: string } };

    expect(res.status).toBe(200);
    expect(body.data.nodes.map((n) => n.id)).toEqual(
      expect.arrayContaining(["1", "2", "3"]),
    );
    // depth=0 clamps to 1, so only focus + parents are fetched
    const fetchedIds = mockGeneaFindUnique.mock.calls.map(
      (args) => (args as any)[0]?.where?.id,
    );
    expect(new Set(fetchedIds)).toEqual(new Set([1, 2, 3]));
  });
});
