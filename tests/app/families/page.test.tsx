import { render, screen } from "@testing-library/react";

const mockGetCurrentUser = vi.fn();
const mockIsMember = vi.fn();
const mockPush = vi.fn();
const mockReplace = vi.fn();
let currentSearchParams = new URLSearchParams();

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  isMember: mockIsMember,
}));

const mockContext = {
  params: { letter: "A", q: "du", family: "Dupont" },
  lang: "en",
  preserved: new URLSearchParams({ lang: "en", letter: "A", q: "du" }),
};

vi.mock("@/lib/page-params", () => ({
  getPageContext: async () => mockContext,
  firstParam: (v: any) => (Array.isArray(v) ? v[0] : v),
  buildPathWithParams: ({ pathname, preserved, lang, params }: any) => {
    const qs = new URLSearchParams(preserved);
    Object.entries(params ?? {}).forEach(([k, v]) => qs.set(k, String(v)));
    qs.set("lang", lang);
    return `${pathname}?${qs.toString()}`;
  },
  buildPreservedForLink: (pathname: string, _p?: URLSearchParams, opts?: any) =>
    `${pathname}?lang=${opts?.lang ?? "en"}`,
}));

vi.mock("@/app/i18n", () => ({
  LOCALES: ["en", "fr", "es", "ht"],
  msg: (_lang: string, key: string) => key,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace, prefetch: vi.fn() }),
  useSearchParams: () => currentSearchParams,
}));

const mockPrisma = {
  genea: {
    groupBy: vi.fn(),
    findMany: vi.fn(),
  },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("FamiliesRegisterPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetCurrentUser.mockResolvedValue(null);
    mockIsMember.mockReturnValue(false);
    mockPush.mockReset();
    mockReplace.mockReset();
    currentSearchParams = new URLSearchParams();
  });

  test("renders letter chips and selected family with people list", async () => {
    Object.assign(mockContext, {
      params: { letter: "A", q: "du", family: "Dupont" },
      preserved: new URLSearchParams({ lang: "en", letter: "A", q: "du" }),
    });
    currentSearchParams = new URLSearchParams({ lang: "en", letter: "A", q: "du" });
    mockPrisma.genea.groupBy.mockResolvedValue([
      { nom: "Dupont", _count: { _all: 3 } },
      { nom: "Durand", _count: { _all: 1 } },
    ]);
    mockPrisma.genea.findMany.mockResolvedValue([
      { id: 1, prenom: "Jean", nom: "Dupont", date_naissance: "1900", date_mort: "1950" },
    ]);

    const page = (await import("@/app/families/page")).default;
    const ui = await page({ searchParams: {} as any });
    render(ui as any);

    expect(screen.getByText("familiesHeroTitle")).toBeInTheDocument();
    expect(screen.getAllByText("A–Z jump")[0]).toBeInTheDocument();
    expect(screen.getAllByText(/all/i)[0]).toBeInTheDocument();
    expect(screen.getByText("D")).toBeInTheDocument();

    expect(screen.getAllByText("Dupont")[0]).toBeInTheDocument();
    expect(screen.getByText("Durand")).toBeInTheDocument();
    expect(screen.getByText("Selected family")).toBeInTheDocument();
    expect(screen.getByText("Jean Dupont")).toBeInTheDocument();
    expect(screen.getByText("Clear selection")).toBeInTheDocument();
  });

  test("shows empty states when no family selected or no families", async () => {
    Object.assign(mockContext, {
      params: { letter: "ALL", q: "", family: "" },
      preserved: new URLSearchParams({ lang: "en", letter: "ALL" }),
    });
    currentSearchParams = new URLSearchParams({ lang: "en", letter: "ALL" });
    mockPrisma.genea.groupBy.mockResolvedValue([]);
    mockPrisma.genea.findMany.mockResolvedValue([]);
    const page = (await import("@/app/families/page")).default;
    const ui = await page({ searchParams: { family: undefined, letter: "ALL" } as any });
    render(ui as any);

    expect(screen.getAllByText(/Pick a family/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/No results/i)).toBeInTheDocument();
  });
});
