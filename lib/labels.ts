export type TypeacteLookup = { code: string; nom: string | null };
export type RoleLookup = { id: number; role: string | null };
export type CommuneLookup = { id: number; commune: string | null; codepays?: string | null };

export function buildTypeacteLabelMap(list: TypeacteLookup[]): Map<string, string> {
  return new Map(
    list
      .filter((t) => t.code)
      .map((t) => [t.code as string, t.nom ?? (t.code as string)]),
  );
}

export function buildRoleLabelMap(list: RoleLookup[]): Map<string, string> {
  return new Map(list.map((r) => [String(r.id), r.role ?? String(r.id)]));
}

export function buildCommuneLabelMap(list: CommuneLookup[]): Map<string, string> {
  return new Map(
    list.map((c) => [String(c.id), c.commune ?? String(c.id)]),
  );
}
