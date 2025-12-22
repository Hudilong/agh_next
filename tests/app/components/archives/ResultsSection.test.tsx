import { render, screen, within } from "@testing-library/react";

import { ResultsSection } from "@/app/components/archives/ResultsSection";

const msg = (_lang: "en", key: any) => key;
const typeLabels = new Map([["M", "Marriage"]]);
const roleLabels = new Map<string, string>();
const communeLabels = new Map<string, string>([
  ["1", "Paris"],
  ["2", "Lyon"],
]);

const baseResult = {
  rows: [],
  total: 0,
  page: 1,
  pageSize: 20,
};

const preserved = new URLSearchParams({ q: "smith" });

describe("ResultsSection", () => {
  test("shows no-filters message when nothing selected", () => {
    render(
      <ResultsSection
        lang="en"
        params={{}}
        results={baseResult}
        preserved={preserved}
        msg={msg}
        typeLabels={typeLabels}
        roleLabels={roleLabels}
        communeLabels={communeLabels}
        canViewDetails
      />,
    );

    expect(screen.getByText("noFilters")).toBeInTheDocument();
    expect(screen.queryByText("noResults")).not.toBeInTheDocument();
  });

  test("shows no-results message when filters present but zero matches", () => {
    render(
      <ResultsSection
        lang="en"
        params={{ nom: "Dup" }}
        results={{ ...baseResult, total: 0 }}
        preserved={preserved}
        msg={msg}
        typeLabels={typeLabels}
        roleLabels={roleLabels}
        communeLabels={communeLabels}
        canViewDetails
      />,
    );

    expect(screen.getByText("noResults")).toBeInTheDocument();
  });

  test("renders result cards, counters, and pagination links", () => {
    const rows = [
      {
        id: 1,
        prenom: "Jean",
        nomdefamille: "Dupont",
        age: "30",
        datedenaissance: "1901-01-01",
        notes: null,
        role: 2,
        profession: null,
        acteid: 10,
        typeacte: "M",
        dateacte: new Date("1925-06-01"),
        actenotes: null,
        communeacte: 1,
        lieudenaissance: 2,
      },
    ];

    render(
      <ResultsSection
        lang="en"
        params={{ nom: "Dup" }}
        results={{ rows, total: 25, page: 2, pageSize: 20 }}
        preserved={preserved}
        msg={msg}
        typeLabels={typeLabels}
        roleLabels={roleLabels}
        communeLabels={communeLabels}
        canViewDetails
      />,
    );

    expect(screen.getByText("resultsCount 21-25/25")).toBeInTheDocument();
    expect(screen.getByText(/25 results/)).toBeInTheDocument();
    expect(screen.getByText("Dupont Jean")).toBeInTheDocument();

    const pagination = within(screen.getByText(/pageLabel/i).closest("div")!);
    const prev = pagination.getByRole("link", { name: "paginationPrev" });
    const next = pagination.getByRole("link", { name: "paginationNext" });

    expect(prev).toHaveAttribute("href", "/archives?q=smith&lang=en&page=1");
    expect(next).toHaveAttribute("aria-disabled", "true");
  });
});
