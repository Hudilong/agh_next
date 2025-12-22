import { Prisma } from "@prisma/client";
import { prisma } from "./prisma";

export type SearchParams = {
  nom?: string | string[];
  prenom?: string | string[];
  notes?: string | string[];
  typeacte?: string | string[];
  role?: string | string[];
  dtmin?: string | string[];
  dtmax?: string | string[];
  lang?: string | string[];
  mode?: string | string[];
  ville?: string | string[];
  pays?: string | string[];
  comacte?: string | string[];
  page?: string | string[];
  sort?: string | string[];
};

export type ResultRow = {
  id: number | null;
  prenom: string | null;
  nomdefamille: string | null;
  age: string | null;
  datedenaissance: string | null;
  notes: string | null;
  role: number | null;
  profession: number | null;
  acteid: number | null;
  typeacte: string | null;
  dateacte: Date | null;
  actenotes: string | null;
  communeacte: number | null;
  lieudenaissance: number | null;
};

export type Lookups = {
  typeacte: { code: string; nom: string | null }[];
  roles: { id: number; role: string | null }[];
  communes: { id: number; commune: string | null }[];
};

export type QueryResult = {
  rows: ResultRow[];
  total: number;
  page: number;
  pageSize: number;
};

export function toStr(val: string | string[] | undefined) {
  return Array.isArray(val) ? val[0] : val ?? "";
}

export function hasFilters(filters: SearchParams) {
  return (
    toStr(filters.nom) ||
    toStr(filters.prenom) ||
    toStr(filters.notes) ||
    toStr(filters.typeacte) ||
    toStr(filters.role) ||
    toStr(filters.dtmin) ||
    toStr(filters.dtmax) ||
    toStr(filters.ville) ||
    toStr(filters.pays) ||
    toStr(filters.comacte)
  );
}

export async function loadLookups(): Promise<Lookups> {
  const [typeacteRaw, roles, communes] = await Promise.all([
    prisma.$queryRaw<{ code: string | null; nom: string | null }[]>`
      SELECT code, nom FROM typeacte WHERE code IS NOT NULL ORDER BY nom
    `,
    prisma.role.findMany({
      select: { id: true, role: true },
      orderBy: { role: "asc" },
    }),
    prisma.communes.findMany({
      select: { id: true, commune: true },
      orderBy: { commune: "asc" },
    }),
  ]);
  return {
    typeacte: typeacteRaw.filter((t) => t.code) as {
      code: string;
      nom: string | null;
    }[],
    roles,
    communes,
  };
}

export async function runQuery(filters: SearchParams): Promise<QueryResult> {
  if (!hasFilters(filters))
    return { rows: [], total: 0, page: 1, pageSize: 20 };

  const conds: Prisma.Sql[] = [];
  const nom = toStr(filters.nom).trim().toLowerCase();
  const prenom = toStr(filters.prenom).trim().toLowerCase();
  const notes = toStr(filters.notes).trim().toLowerCase();
  const typeacte = toStr(filters.typeacte).trim();
  const role = toStr(filters.role).trim();
  const dtmin = toStr(filters.dtmin).trim();
  const dtmax = toStr(filters.dtmax).trim();
  const mode = toStr(filters.mode).trim() || "d";
  const ville = toStr(filters.ville).trim().toLowerCase();
  const pays = toStr(filters.pays).trim().toLowerCase();
  const comacteRaw = toStr(filters.comacte);
  const comacte = comacteRaw ? Number(comacteRaw) : null;
  const pageParam = Number.parseInt(toStr(filters.page) || "1", 10);
  const page = Number.isNaN(pageParam) || pageParam < 1 ? 1 : pageParam;
  const pageSize = 20;
  const offset = (page - 1) * pageSize;
  const sort = toStr(filters.sort) || "date_asc";

  if (nom) conds.push(Prisma.sql`LOWER(p.nomdefamille) LIKE ${nom + "%"}`);
  if (prenom) conds.push(Prisma.sql`LOWER(p.prenom) LIKE ${prenom + "%"}`);
  if (notes) {
    const pattern =
      mode === "e"
        ? notes
        : mode === "i"
          ? `%${notes}%`
          : `${notes}%`;
    conds.push(
      Prisma.sql`(LOWER(p.notes) LIKE ${pattern} OR LOWER(a.notes) LIKE ${pattern})`
    );
  }
  if (typeacte) conds.push(Prisma.sql`a.typeacte = ${typeacte}`);
  const roleNum = Number(role);
  if (role && !Number.isNaN(roleNum))
    conds.push(Prisma.sql`p.role = ${roleNum}`);
  const minYear = Number(dtmin);
  if (dtmin && !Number.isNaN(minYear))
    conds.push(Prisma.sql`YEAR(a.dateacte) >= ${minYear}`);
  const maxYear = Number(dtmax);
  if (dtmax && !Number.isNaN(maxYear))
    conds.push(Prisma.sql`YEAR(a.dateacte) <= ${maxYear}`);
  if (comacteRaw && comacte !== null && !Number.isNaN(comacte))
    conds.push(Prisma.sql`a.communeacte = ${comacte}`);
  if (ville) {
    conds.push(Prisma.sql`LOWER(cb.commune) LIKE ${"%" + ville + "%"}`);
  }
  if (pays) {
    conds.push(
      Prisma.sql`(LOWER(py.paysfrancais) LIKE ${"%" + pays + "%"} OR LOWER(py.paysanglais) LIKE ${"%" + pays + "%"})`
    );
  }

  let whereClause: Prisma.Sql | null = null;
  conds.forEach((clause, idx) => {
    if (idx === 0) {
      whereClause = Prisma.sql`WHERE ${clause}`;
    } else {
      whereClause = Prisma.sql`${whereClause} AND ${clause}`;
    }
  });

  const joinClauses: Prisma.Sql[] = [Prisma.sql`JOIN actes a ON a.id = p.acte`];
  if (ville || pays) {
    joinClauses.push(Prisma.sql`LEFT JOIN communes cb ON cb.id = p.lieudenaissance`);
  }
  if (pays) {
    joinClauses.push(Prisma.sql`LEFT JOIN pays py ON py.codepays = cb.codepays`);
  }

  let orderBy: Prisma.Sql;
  switch (sort) {
    case "date_desc":
      orderBy = Prisma.sql`ORDER BY a.dateacte IS NULL, a.dateacte DESC, p.nomdefamille, p.prenom`;
      break;
    case "name_asc":
      orderBy = Prisma.sql`ORDER BY p.nomdefamille ASC, p.prenom ASC`;
      break;
    case "name_desc":
      orderBy = Prisma.sql`ORDER BY p.nomdefamille DESC, p.prenom DESC`;
      break;
    case "date_asc":
    default:
      orderBy = Prisma.sql`ORDER BY a.dateacte IS NULL, a.dateacte ASC, p.nomdefamille, p.prenom`;
      break;
  }

  let joins: Prisma.Sql | null = null;
  joinClauses.forEach((clause, idx) => {
    if (idx === 0) joins = clause;
    else joins = Prisma.sql`${joins} ${clause}`;
  });

  const query = Prisma.sql`
    SELECT
      p.id,
      p.prenom,
      p.nomdefamille,
      p.age,
      p.datedenaissance,
      p.notes,
      p.role,
      p.profession,
      p.acte AS acteid,
      a.typeacte,
      a.dateacte,
      a.notes AS actenotes,
      a.communeacte,
      p.lieudenaissance
    FROM personnes p
    ${joins ?? Prisma.sql``}
    ${whereClause ?? Prisma.sql``}
    ${orderBy}
    LIMIT ${pageSize}
    OFFSET ${offset}
  `;

  const countQuery = Prisma.sql`
    SELECT COUNT(*) as total
    FROM personnes p
    ${joins ?? Prisma.sql``}
    ${whereClause ?? Prisma.sql``}
  `;

  const [rows, countResult] = await Promise.all([
    prisma.$queryRaw<ResultRow[]>(query),
    prisma.$queryRaw<{ total: bigint | number }[]>(countQuery),
  ]);

  const totalRaw = countResult[0]?.total ?? 0;
  const total = typeof totalRaw === "bigint" ? Number(totalRaw) : totalRaw;

  return { rows, total, page, pageSize };
}
