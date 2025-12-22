import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { parseOptionalNumber } from "@/lib/page-params";
import { canAccessGenealogy, getCurrentUser } from "@/lib/auth";

type GeneaPerson = {
  id: number;
  prenom: string | null;
  nom: string | null;
  date_naissance: string | null;
  date_mort: string | null;
  sexe: string | null;
  pere: number | null;
  mere: number | null;
  commentaires: string | null;
};

type Direction = "asc" | "desc";

type ApiNode = {
  id: string;
  name: string;
  familyName?: string | null;
  birth?: string | null;
  death?: string | null;
  gender?: "m" | "f" | null;
  tags?: string[];
  note?: string | null;
};

type ApiEdge = {
  source: string;
  target: string;
  type: "parent" | "spouse";
};

type GraphResponse = {
  nodes: ApiNode[];
  edges: ApiEdge[];
  focusId: string;
};
type ApiResponse =
  | { data: GraphResponse; error: null }
  | { data: null; error: string };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const idParam = searchParams.get("id");
  const dirParam = (searchParams.get("direction") as Direction) ?? "desc";
  const depthParam = searchParams.get("depth");

  const user = await getCurrentUser();
  if (!canAccessGenealogy(user)) {
    return NextResponse.json(
      { data: null, error: "Unauthorized" } satisfies ApiResponse,
      { status: 401 },
    );
  }

  const idNum = parseOptionalNumber(idParam);
  if (!idParam || idNum == null) {
    return NextResponse.json(
      { data: null, error: "Missing or invalid id parameter" } satisfies ApiResponse,
      { status: 400 },
    );
  }

  const direction: Direction = dirParam === "asc" ? "asc" : "desc";
  let maxDepth = parseOptionalNumber(depthParam) ?? 4;
  if (maxDepth < 1) maxDepth = 1;
  if (maxDepth > 6) maxDepth = 6;

  const focus = await prisma.genea.findUnique({ where: { id: idNum } });
  if (!focus) {
    return NextResponse.json(
      { data: null, error: "Person not found" } satisfies ApiResponse,
      { status: 404 },
    );
  }

  const nodeMap = new Map<number, ApiNode>();
  const edges: ApiEdge[] = [];
  const visited = new Set<number>();

  const ensureNode = (p: GeneaPerson | null) => {
    if (!p) return;
    if (!nodeMap.has(p.id)) {
      nodeMap.set(p.id, formatNode(p));
    }
  };

  const addEdge = (source: number, target: number, type: "parent" | "spouse") => {
    if (edges.some((e) => e.source === `${source}` && e.target === `${target}` && e.type === type)) {
      return;
    }
    // prevent duplicate spouse edges in opposite direction
    if (type === "spouse" && edges.some((e) => e.source === `${target}` && e.target === `${source}` && e.type === type)) {
      return;
    }
    edges.push({ source: `${source}`, target: `${target}`, type });
  };

  if (direction === "asc") {
    await walkAsc(idNum, 0);
  } else {
    await walkDesc(idNum, 0);
  }

  return NextResponse.json(
    {
      data: {
        nodes: Array.from(nodeMap.values()),
        edges,
        focusId: `${idNum}`,
      },
      error: null,
    } satisfies ApiResponse,
  );

  async function walkAsc(id: number, depth: number) {
    if (depth > maxDepth || visited.has(id)) return;
    visited.add(id);
    const person = id === focus.id ? focus : await prisma.genea.findUnique({ where: { id } });
    if (!person) return;
    ensureNode(person);

    if (depth === maxDepth) return;

    if (person.pere) {
      const father = await prisma.genea.findUnique({ where: { id: person.pere } });
      if (father) {
        ensureNode(father);
        addEdge(father.id, person.id, "parent");
        await walkAsc(father.id, depth + 1);
      }
    }
    if (person.mere) {
      const mother = await prisma.genea.findUnique({ where: { id: person.mere } });
      if (mother) {
        ensureNode(mother);
        addEdge(mother.id, person.id, "parent");
        await walkAsc(mother.id, depth + 1);
      }
    }
  }

  async function walkDesc(id: number, depth: number) {
    if (depth > maxDepth || visited.has(id)) return;
    visited.add(id);
    const person = id === focus.id ? focus : await prisma.genea.findUnique({ where: { id } });
    if (!person) return;
    ensureNode(person);

    if (depth === maxDepth) return;

    // marriages
    const marriages = await prisma.genea2.findMany({
      where: { OR: [{ pere: id }, { mere: id }] },
      take: 50,
    });

    for (const mar of marriages) {
      const spouseId = mar.pere === id ? mar.mere : mar.pere;
      if (spouseId) {
        const spouse = await prisma.genea.findUnique({ where: { id: spouseId } });
        if (spouse) {
          ensureNode(spouse);
          addEdge(person.id, spouse.id, "spouse");
        }
      }

      if (spouseId) {
        const kids = await prisma.genea.findMany({
          where: {
            OR: [
              { pere: id, mere: spouseId },
              { pere: spouseId, mere: id },
            ],
          },
          take: 200,
          orderBy: [{ date_naissance: "asc" }, { prenom: "asc" }],
        });
        for (const child of kids) {
          ensureNode(child);
          if (child.pere) addEdge(child.pere, child.id, "parent");
          if (child.mere) addEdge(child.mere, child.id, "parent");
          await walkDesc(child.id, depth + 1);
        }
      }
    }
  }
}

function formatNode(p: GeneaPerson): ApiNode {
  const name = `${p.prenom ?? ""} ${p.nom ?? ""}`.trim() || `#${p.id}`;
  return {
    id: `${p.id}`,
    name,
    familyName: p.nom,
    birth: p.date_naissance,
    death: p.date_mort,
    gender: p.sexe === "f" ? "f" : "m",
    note: p.commentaires,
  };
}
