import { createHmac } from "crypto";
import { cookies } from "next/headers";
import { prisma } from "./prisma";
import type { users } from "@prisma/client";

const SESSION_COOKIE = "agh_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type MembershipTier = "none" | "member" | "support";

type SessionPayload = {
  userId: number;
  issuedAt: number;
};

function signPayload(payload: SessionPayload) {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token: string): SessionPayload | null {
  try {
    const [data, sig] = token.split(".");
    if (!data || !sig) return null;
    const expected = createHmac("sha256", SESSION_SECRET).update(data).digest("base64url");
    if (expected !== sig) return null;
    const parsed = JSON.parse(Buffer.from(data, "base64url").toString("utf8"));
    if (typeof parsed?.userId !== "number") return null;
    return parsed as SessionPayload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getCurrentUser(): Promise<users | null> {
  const session = await getSession();
  if (!session) return null;
  return prisma.users.findUnique({
    where: { id: session.userId },
  });
}

export async function setSessionCookie(userId: number) {
  const payload: SessionPayload = { userId, issuedAt: Date.now() };
  const token = signPayload(payload);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

function hasActiveSubscription(user: users | null): boolean {
  if (!user) return false;
  if (user.admin && user.admin > 0) return true;
  if (!user.expiration) return false;
  return user.expiration.getTime() > Date.now();
}

export function getMembershipTier(user: users | null): MembershipTier {
  if (!hasActiveSubscription(user)) return "none";

  // Legacy rules: membership 1 or 3 = support (archives + genealogy), membership 2 = genealogy only.
  const level = user?.membership ?? 0;
  if (user?.admin && user.admin > 0) return "support";
  if (level === 1 || level === 3) return "support";
  if (level > 0 && level <= 3) return "member";
  return "none";
}

export function isMember(user: users | null): boolean {
  return getMembershipTier(user) !== "none";
}

export function canAccessGenealogy(user: users | null): boolean {
  const tier = getMembershipTier(user);
  return tier === "member" || tier === "support";
}

export function canAccessArchives(user: users | null): boolean {
  return getMembershipTier(user) === "support";
}
