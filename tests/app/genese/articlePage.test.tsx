import { render, screen } from "@testing-library/react";

const mockNotFound = vi.fn(() => {
  throw new Error("NOT_FOUND");
});

vi.mock("@/lib/page-params", () => ({
  getPageContext: async () => ({ lang: "en", preserved: new URLSearchParams() }),
  buildPreservedForLink: (pathname: string, preserved?: URLSearchParams, opts?: any) =>
    `${pathname}?${(preserved ?? new URLSearchParams()).toString()}${opts?.lang ? `&lang=${opts.lang}` : ""}`,
  buildPathWithParams: ({ pathname, preserved, lang }: any) =>
    `${pathname}?${preserved.toString()}&lang=${lang}`,
}));

vi.mock("@/app/i18n", () => ({
  LOCALES: ["en", "fr", "es", "ht"],
  msg: (_lang: string, key: string) => key,
}));

vi.mock("../../copy", () => ({
  getGeneseCopy: () => ({
    byAuthor: (a: string) => `by ${a}`,
    publishedOn: (d: string) => `published ${d}`,
    featured: "Featured",
  }),
}));

vi.mock("next/navigation", () => ({
  notFound: mockNotFound,
}));

const mockPrisma = {
  newsSection: { findUnique: vi.fn() },
  newsArticle: { findFirst: vi.fn() },
};

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

describe("Genese Article Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("throws notFound when section or article missing", async () => {
    const page = (await import("@/app/genese/[section]/[article]/page")).default;
    mockPrisma.newsSection.findUnique.mockResolvedValue(null);
    await expect(
      page({ params: { section: "missing", article: "a" }, searchParams: {} }),
    ).rejects.toThrow("NOT_FOUND");

    mockPrisma.newsSection.findUnique.mockResolvedValue({ id: 1, title: "Sec", slug: "s" });
    mockPrisma.newsArticle.findFirst.mockResolvedValue(null);
    await expect(
      page({ params: { section: "s", article: "nope" }, searchParams: {} }),
    ).rejects.toThrow("NOT_FOUND");
  });

  test("renders blocks by type with status and featured badge", async () => {
    const page = (await import("@/app/genese/[section]/[article]/page")).default;
    mockPrisma.newsSection.findUnique.mockResolvedValue({ id: 1, title: "Sec", slug: "s" });
    mockPrisma.newsArticle.findFirst.mockResolvedValue({
      id: 2,
      slug: "art",
      title: "Article title",
      author: "Author",
      publishedAt: new Date("2020-01-02"),
      status: "PUBLISHED",
      isFeatured: true,
      blocks: [
        { id: 1, type: "HEADING", content: "Heading", meta: { level: 7 } },
        { id: 2, type: "PARAGRAPH", content: "Paragraph", meta: null },
        { id: 3, type: "CODE", content: "code()", meta: null },
        { id: 4, type: "HTML", content: "<strong>html</strong>", meta: null },
        { id: 5, type: "UNKNOWN", content: "fallback", meta: null },
      ],
    });

    const ui = await page({ params: { section: "s", article: "art" }, searchParams: {} });
    render(ui as any);

    expect(screen.getByText("Article title")).toBeInTheDocument();
    expect(screen.getByText("PUBLISHED")).toBeInTheDocument();
    expect(screen.getByText("Featured")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 6, name: "Heading" })).toBeInTheDocument();
    expect(screen.getByText("Paragraph")).toBeInTheDocument();
    expect(screen.getByText("code()")).toBeInTheDocument();
    expect(screen.getByText("html")).toBeInTheDocument();
    expect(screen.getByText("fallback")).toBeInTheDocument();
  });
});
