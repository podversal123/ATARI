import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { AuthLevel, RoleScope } from "@/lib/generated/prisma/enums";
import { getSecretKey } from "@/lib/auth-secret";

const COOKIE_NAME = "ams_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12; // 12h - re-login daily, not a silent-forever session

/**
 * `role` stays the real enforcement level every existing check in this app
 * already branches on (unchanged since before Role Management existed).
 * The rest describe the human-facing Role a user is assigned and what it
 * scopes them to - see prisma/schema.prisma's Role model and "Roles based
 * access system 1.0" (client spec): a role with no scope narrower than its
 * `scope` type set here has no data outside it, checked at the API level on
 * every scoped query, not just hidden in the UI.
 */
export type SessionPayload = {
  sub: string;
  role: AuthLevel;
  roleId: string | null;
  roleSlug: string | null;
  roleScope: RoleScope | null;
  zoneId: string;
  kvkId: string | null;
  stateId: string | null;
  districtId: string | null;
  hostOrgId: string | null;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSessionCookie(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/** Reads and verifies the session cookie. Returns null if missing/invalid/expired - callers decide what to do (redirect, 401, etc). */
export async function getSessionPayload(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}

/** Loads the full current user (with KVK name for the client session shape) or null if not authenticated. */
export async function getCurrentUser() {
  const payload = await getSessionPayload();
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    include: { kvk: true },
  });
  return user;
}

export { COOKIE_NAME as SESSION_COOKIE_NAME };
