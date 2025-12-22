import { Prisma } from "@prisma/client";

const mockQueryRaw = vi.fn();

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $queryRaw: mockQueryRaw,
  },
}));

const sqlToText = (sql: Prisma.Sql) =>
  sql.strings.reduce((acc, str, idx) => {
    const val = sql.values?.[idx];
    const placeholder = val !== undefined ? `:${String(val)}` : "";
    return acc + str + placeholder;
  }, "");

describe("search helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("hasFilters detects truthy search params", async () => {
    const { hasFilters } = await import("@/lib/search");
    expect(hasFilters({})).toBeFalsy();
    expect(hasFilters({ nom: "" })).toBeFalsy();
    expect(hasFilters({ nom: "Dup" })).toBeTruthy();
    expect(hasFilters({ notes: ["", "text"] })).toBeFalsy();
    expect(hasFilters({ comacte: "5" })).toBeTruthy();
  });

  test("runQuery short-circuits with no filters", async () => {
    const { runQuery } = await import("@/lib/search");
    const result = await runQuery({});
    expect(result).toEqual({ rows: [], total: 0, page: 1, pageSize: 20 });
    expect(mockQueryRaw).not.toHaveBeenCalled();
  });

  test("applies all filters, joins, pagination, and sorting", async () => {
    const rows = [{ id: 1, nomdefamille: "Dupont" }] as any;
    let callCount = 0;
    mockQueryRaw.mockImplementation(async (sql) => {
      callCount += 1;
      if (callCount === 1) {
        return rows;
      }
      return [{ total: BigInt(12) }];
    });

    const { runQuery } = await import("@/lib/search");
    const result = await runQuery({
      nom: "Du",
      prenom: "Je",
      notes: "note",
      mode: "i",
      typeacte: "M",
      role: "2",
      dtmin: "1900",
      dtmax: "1950",
      comacte: "3",
      ville: "paris",
      pays: "fr",
      sort: "name_desc",
      page: "2",
    });

    expect(result).toEqual({ rows, total: 12, page: 2, pageSize: 20 });
    expect(mockQueryRaw).toHaveBeenCalledTimes(2);
    const [query, countQuery] = mockQueryRaw.mock.calls.map((c) => c[0] as Prisma.Sql);

    const text = sqlToText(query).replace(/\s+/g, " ");
    expect(text).toContain("JOIN actes a ON a.id = p.acte");
    expect(text).toContain("LEFT JOIN communes cb ON cb.id = p.lieudenaissance");
    expect(text).toContain("LEFT JOIN pays py ON py.codepays = cb.codepays");
    expect(text).toContain("ORDER BY p.nomdefamille DESC, p.prenom DESC");

    expect(query.values).toEqual([
      "du%",
      "je%",
      "%note%",
      "%note%",
      "M",
      2,
      1900,
      1950,
      3,
      "%paris%",
      "%fr%",
      "%fr%",
      20,
      20,
    ]);

    expect(sqlToText(countQuery)).toContain("COUNT(*) as total");
    expect(countQuery.values).toEqual([
      "du%",
      "je%",
      "%note%",
      "%note%",
      "M",
      2,
      1900,
      1950,
      3,
      "%paris%",
      "%fr%",
      "%fr%",
    ]);
  });

  test("notes search mode patterns change with mode flag", async () => {
    const { runQuery } = await import("@/lib/search");
    mockQueryRaw.mockResolvedValueOnce([]).mockResolvedValueOnce([{ total: 0 }]);
    await runQuery({ notes: "abc", mode: "d" });
    const defaultQuery = mockQueryRaw.mock.calls[0][0] as Prisma.Sql;
    expect(defaultQuery.values?.[0]).toBe("abc%");

    mockQueryRaw.mockClear();
    mockQueryRaw.mockResolvedValueOnce([]).mockResolvedValueOnce([{ total: 0 }]);
    await runQuery({ notes: "abc", mode: "e" });
    const exactQuery = mockQueryRaw.mock.calls[0][0] as Prisma.Sql;
    expect(exactQuery.values?.[0]).toBe("abc");
  });
});
