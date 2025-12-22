import { afterEach, describe, expect, it, vi } from "vitest";

import { formatLongDate, formatShortDate } from "@/lib/format";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("format helpers", () => {
  it("formats long dates with locale-specific options", () => {
    const spy = vi
      .spyOn(Date.prototype, "toLocaleDateString")
      .mockReturnValue("15 avril 2023");

    const result = formatLongDate(new Date("2023-04-15T00:00:00Z"), "fr");

    expect(result).toBe("15 avril 2023");
    expect(spy).toHaveBeenCalledWith("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  it("formats short dates using the locale map", () => {
    const spy = vi
      .spyOn(Date.prototype, "toLocaleDateString")
      .mockReturnValue("Feb 01, 2021");

    const result = formatShortDate("2021-02-01", "en");

    expect(result).toBe("Feb 01, 2021");
    expect(spy).toHaveBeenCalledWith("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  });

  it("falls back to the raw string when parsing fails", () => {
    expect(formatLongDate("2020-13-05", "fr")).toBe("2020-13-05");
  });

  it("returns an empty string for nullish inputs", () => {
    expect(formatLongDate(null, "en")).toBe("");
    expect(formatShortDate(undefined, "fr")).toBe("");
  });
});
