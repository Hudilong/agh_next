import { render, screen } from "@testing-library/react";

const mockGetCurrentUser = vi.fn();
const mockIsMember = vi.fn();
const mockCanAccessArchives = vi.fn();
const mockParseIdOrNotFound = vi.fn();
const mockNotFound = vi.fn(() => {
  throw new Error("NOT_FOUND");
});

vi.mock("@/lib/auth", () => ({
  getCurrentUser: mockGetCurrentUser,
  isMember: mockIsMember,
  canAccessArchives: mockCanAccessArchives,
}));

vi.mock("@/lib/page-params", () => ({
  getPageContext: async () => ({
    lang: "en",
    preserved: new URLSearchParams({ lang: "en" }),
  }),
  parseIdOrNotFound: mockParseIdOrNotFound,
  buildPreservedForLink: (pathname: string, preserved?: URLSearchParams, opts?: any) =>
    `${pathname}?${(preserved ?? new URLSearchParams()).toString()}${opts?.lang ? `&lang=${opts.lang}` : ""}`,
  buildPathWithParams: ({ pathname, preserved, lang }: any) =>
    `${pathname}?${preserved.toString()}&lang=${lang}`,
}));

vi.mock("@/app/i18n", () => ({
  LOCALES: ["en", "fr", "es", "ht"],
  msg: (_lang: string, key: string) => key,
}));

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockPrisma = {
  actes: { findUnique: vi.fn() },
  personnes: { findMany: vi.fn() },
  $queryRaw: vi.fn(),
  role: { findMany: vi.fn() },
  communes: { findMany: vi.fn() },
  pays: { findMany: vi.fn() },
  officiers: { findMany: vi.fn() },
  metiers: { findMany: vi.fn() },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("ActDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockParseIdOrNotFound.mockReturnValue(10);
  });

  test("renders member gate when user cannot view archives", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 1 });
    mockIsMember.mockReturnValue(true);
    mockCanAccessArchives.mockReturnValue(false);
    const page = (await import("@/app/acts/[id]/page")).default;

    const ui = await page({ params: { id: "10" }, searchParams: {} as any });
    render(ui as any);

    expect(screen.getAllByText("supportOnly").length).toBeGreaterThan(0);
    expect(mockPrisma.actes.findUnique).not.toHaveBeenCalled();
  });

  test("shows not found status when act missing", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 1 });
    mockIsMember.mockReturnValue(true);
    mockCanAccessArchives.mockReturnValue(true);
    mockPrisma.actes.findUnique.mockResolvedValue(null);
    mockPrisma.personnes.findMany.mockResolvedValue([]);
    mockPrisma.$queryRaw.mockResolvedValue([]);
    mockPrisma.role.findMany.mockResolvedValue([]);
    mockPrisma.communes.findMany.mockResolvedValue([]);
    mockPrisma.pays.findMany.mockResolvedValue([]);
    mockPrisma.officiers.findMany.mockResolvedValue([]);
    mockPrisma.metiers.findMany.mockResolvedValue([]);
    const page = (await import("@/app/acts/[id]/page")).default;

    const ui = await page({ params: { id: "999" }, searchParams: {} as any });
    render(ui as any);

    expect(screen.getByText("actNotFound")).toBeInTheDocument();
  });

  test("renders act details with label fallbacks", async () => {
    mockGetCurrentUser.mockResolvedValue({ id: 1 });
    mockIsMember.mockReturnValue(true);
    mockCanAccessArchives.mockReturnValue(true);
    mockPrisma.actes.findUnique.mockResolvedValue({
      id: 10,
      typeacte: "A",
      communeacte: 1,
      communeevenement: null,
      dateacte: "2020-01-01",
      dateevenement: null,
      officier: 5,
      numeroacte: null,
      pageacte: null,
      notes: null,
    });
    mockPrisma.personnes.findMany.mockResolvedValue([
      { id: 1, nomdefamille: "Doe", prenom: "John" },
    ]);
    mockPrisma.$queryRaw.mockResolvedValue([{ code: "A", nom: "Acte" }]);
    mockPrisma.role.findMany.mockResolvedValue([]);
    mockPrisma.communes.findMany.mockResolvedValue([
      { id: 1, commune: "Paris", codepays: "FR" },
    ]);
    mockPrisma.pays.findMany.mockResolvedValue([
      { codepays: "FR", paysfrancais: "France", paysanglais: "France" },
    ]);
    mockPrisma.officiers.findMany.mockResolvedValue([{ id: 5, nomprenom: "Officer" }]);
    mockPrisma.metiers.findMany.mockResolvedValue([]);
    const page = (await import("@/app/acts/[id]/page")).default;

    const ui = await page({ params: { id: "10" }, searchParams: {} as any });
    render(ui as any);

    expect(screen.getByText("actDetailTitle #10")).toBeInTheDocument();
    expect(screen.getByText("Acte")).toBeInTheDocument();
    expect(screen.getAllByText(/Paris/)[0]).toBeInTheDocument();
    expect(screen.getByText(/Officer/)).toBeInTheDocument();
    expect(screen.getByText("actParticipants")).toBeInTheDocument();
  });
});
