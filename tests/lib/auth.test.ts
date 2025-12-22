import { createHmac } from "crypto";
import type { users } from "@prisma/client";

const mockCookies = vi.fn();

vi.mock("next/headers", () => ({
  cookies: mockCookies,
}));

const createCookieStore = () => {
  const jar = new Map<string, string>();
  const record: Array<{ name: string; value: string; options?: any }> = [];
  return {
    get: vi.fn((name: string) => (jar.has(name) ? { value: jar.get(name)! } : undefined)),
    set: vi.fn((name: string, value: string, options?: any) => {
      jar.set(name, value);
      record.push({ name, value, options });
    }),
    delete: vi.fn((name: string) => {
      jar.delete(name);
    }),
    record,
  };
};

const makeUser = (attrs: Partial<users> = {}): users =>
  ({
    id: attrs.id ?? 1,
    membership: null,
    admin: null,
    expiration: null,
    motpasse: null,
    usager: null,
    nom: null,
    prenom: null,
    adresse: null,
    telephone: null,
    pagination: null,
    donnees: null,
    email: null,
    codepays: null,
    compagnie: null,
    permissions: null,
    visites: null,
    historique: null,
    paypal: null,
    note_expiration: null,
    url: null,
    indexation: null,
    email_public: null,
    pays: null,
    menu: null,
    conseil: null,
    ...attrs,
  }) as users;

const signToken = (payload: object, secret: string) => {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", secret).update(data).digest("base64url");
  return `${data}.${sig}`;
};

describe("auth helpers", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    process.env.SESSION_SECRET = "test-secret";
    process.env.NODE_ENV = "test";
  });

  test("membership tier matrix handles admin and membership levels with expiration", async () => {
    const future = new Date(Date.now() + 1000 * 60 * 60);
    const past = new Date(Date.now() - 1000 * 60 * 60);
    const auth = await import("@/lib/auth");

    expect(auth.getMembershipTier(makeUser({ membership: 1, expiration: future }))).toBe(
      "support",
    );
    expect(auth.getMembershipTier(makeUser({ membership: 2, expiration: future }))).toBe(
      "member",
    );
    expect(auth.getMembershipTier(makeUser({ membership: 3, expiration: future }))).toBe(
      "support",
    );
    expect(auth.getMembershipTier(makeUser({ membership: 4, expiration: future }))).toBe(
      "none",
    );
    expect(auth.getMembershipTier(makeUser({ membership: 1, expiration: past }))).toBe(
      "none",
    );
    expect(auth.getMembershipTier(makeUser({ admin: 1, expiration: null }))).toBe(
      "support",
    );

    expect(auth.isMember(makeUser({ membership: 2, expiration: future }))).toBe(true);
    expect(auth.canAccessGenealogy(makeUser({ membership: 2, expiration: future }))).toBe(
      true,
    );
    expect(auth.canAccessArchives(makeUser({ membership: 2, expiration: future }))).toBe(
      false,
    );
  });

  test("getSession returns null for tampered tokens", async () => {
    const store = createCookieStore();
    mockCookies.mockResolvedValue(store);
    const auth = await import("@/lib/auth");

    const validToken = signToken({ userId: 9, issuedAt: 123 }, "test-secret");
    store.set("agh_session", validToken);
    const session = await auth.getSession();
    expect(session).toEqual({ userId: 9, issuedAt: 123 });

    const [data] = validToken.split(".");
    store.set("agh_session", `${data}.bad-signature`);
    const invalid = await auth.getSession();
    expect(invalid).toBeNull();
  });

  test("setSessionCookie and clearSessionCookie set correct attributes", async () => {
    const store = createCookieStore();
    mockCookies.mockResolvedValue(store);
    const auth = await import("@/lib/auth");

    await auth.setSessionCookie(42);
    expect(store.set).toHaveBeenCalledTimes(1);
    const setCall = store.record.at(-1);
    expect(setCall?.name).toBe("agh_session");
    expect(setCall?.options?.httpOnly).toBe(true);
    expect(setCall?.options?.secure).toBe(false);

    process.env.NODE_ENV = "production";
    await auth.setSessionCookie(99);
    const prodCall = store.record.at(-1);
    expect(prodCall?.options?.secure).toBe(true);

    await auth.clearSessionCookie();
    expect(store.delete).toHaveBeenCalledWith("agh_session");
  });
});
