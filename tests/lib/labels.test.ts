import { describe, expect, it } from "vitest";

import {
  buildCommuneLabelMap,
  buildRoleLabelMap,
  buildTypeacteLabelMap,
} from "@/lib/labels";

describe("label builders", () => {
  it("builds typeacte label map skipping empty codes", () => {
    const map = buildTypeacteLabelMap([
      { code: "ACT", nom: "Acte" },
      { code: "WED", nom: null },
      // @ts-expect-error intentionally malformed to ensure filtering
      { code: null, nom: "Missing code" },
    ]);

    expect(map.get("ACT")).toBe("Acte");
    expect(map.get("WED")).toBe("WED");
    expect(map.has("")).toBe(false);
  });

  it("builds role label map with stringified keys", () => {
    const map = buildRoleLabelMap([
      { id: 1, role: "Parent" },
      { id: 2, role: null },
    ]);

    expect(map.get("1")).toBe("Parent");
    expect(map.get("2")).toBe("2");
  });

  it("builds commune label map preserving ids as strings", () => {
    const map = buildCommuneLabelMap([
      { id: 7, commune: "Port-au-Prince" },
      { id: 8, commune: null },
    ]);

    expect(map.get("7")).toBe("Port-au-Prince");
    expect(map.get("8")).toBe("8");
  });
});
