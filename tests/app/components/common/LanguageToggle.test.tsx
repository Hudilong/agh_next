import { render, screen } from "@testing-library/react";

import { LanguageToggle } from "@/app/components/common/LanguageToggle";

describe("LanguageToggle", () => {
  test("renders links for all locales with active styling", () => {
    const preserved = new URLSearchParams({ q: "smith" });

    render(<LanguageToggle lang="fr" preserved={preserved} pathname="/archives" />);

    const frLink = screen.getByRole("link", { name: "FR" });
    const enLink = screen.getByRole("link", { name: "EN" });

    const frUrl = new URL(frLink.getAttribute("href") ?? "", "http://localhost");
    const enUrl = new URL(enLink.getAttribute("href") ?? "", "http://localhost");

    expect(frUrl.pathname).toBe("/archives");
    expect(frUrl.searchParams.get("lang")).toBe("fr");
    expect(frUrl.searchParams.get("q")).toBe("smith");

    expect(enUrl.searchParams.get("lang")).toBe("en");

    expect(frLink.className).toContain("bg-haiti-navy");
    expect(enLink.className).not.toContain("bg-haiti-navy");
  });
});
