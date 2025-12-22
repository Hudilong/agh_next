import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

import { notFound } from "next/navigation";

import {
  buildPathWithParams,
  buildPreservedForLink,
  buildPreservedParams,
  firstParam,
  getPageContext,
  parseIdOrNotFound,
  parseOptionalNumber,
  resolveLang,
  resolveSearchParams,
} from "@/lib/page-params";

const notFoundMock = vi.mocked(notFound);

afterEach(() => {
  vi.clearAllMocks();
});

describe("page params helpers", () => {
  it("resolves search params from promises", async () => {
    const params = await resolveSearchParams(Promise.resolve({ foo: "bar" }));
    expect(params).toEqual({ foo: "bar" });
  });

  it("extracts the first param value", () => {
    expect(firstParam("single")).toBe("single");
    expect(firstParam(["first", "second"])).toBe("first");
    expect(firstParam(undefined)).toBeUndefined();
  });

  it("normalizes language with fallback to fr", () => {
    expect(resolveLang({ lang: "en" })).toBe("en");
    expect(resolveLang({ lang: "pt" })).toBe("fr");
  });

  it("preserves only non-lang, truthy values", () => {
    const preserved = buildPreservedParams({
      lang: "en",
      q: "query",
      empty: "",
      arr: ["first", "second"],
      nullable: null,
    });

    expect(preserved.toString()).toBe("q=query&arr=first");
    expect(preserved.get("lang")).toBeNull();
  });

  it("builds a path merging preserved params and overrides", () => {
    const preserved = buildPreservedParams({ q: "name" });

    const url = buildPathWithParams({
      pathname: "/archives",
      preserved,
      lang: "fr",
      params: { page: 2, empty: null },
    });

    expect(url).toBe("/archives?q=name&lang=fr&page=2");
  });

  it("builds preserved links without an initial search params object", () => {
    const url = buildPreservedForLink("/families", undefined, {
      lang: "en",
      params: { letter: "A" },
    });

    expect(url).toBe("/families?lang=en&letter=A");
  });

  it("parses ids and delegates to notFound on invalid input", () => {
    expect(parseIdOrNotFound("42")).toBe(42);
    expect(() => parseIdOrNotFound("abc")).toThrowError("NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalledTimes(1);
  });

  it("parses optional numbers returning null when invalid", () => {
    expect(parseOptionalNumber("5")).toBe(5);
    expect(parseOptionalNumber("oops")).toBeNull();
    expect(parseOptionalNumber(null)).toBeNull();
  });

  it("returns page context with resolved lang and preserved params", async () => {
    const { params, lang, preserved } = await getPageContext({
      lang: "en",
      foo: "bar",
      blank: "",
    });

    expect(params).toEqual({ lang: "en", foo: "bar", blank: "" });
    expect(lang).toBe("en");
    expect(preserved.toString()).toBe("foo=bar");
  });
});
